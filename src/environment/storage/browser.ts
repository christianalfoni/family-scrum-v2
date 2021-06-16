import firebase from "firebase/app";
import { events } from "react-states";
import {
  BarcodeDTO,
  CheckListItemDTO,
  FamilyDTO,
  GroceryDTO,
  Storage,
  TodoDTO,
  WeekDTO,
  WeekTodoActivity,
} from ".";
import {
  getCurrentWeekId,
  getNextWeekId,
  getPreviousWeekId,
} from "../../utils";
import debounce from "lodash.debounce";
import { StorageEvent } from "./";
import { createCheckListItemsByTodoId } from "./utils";

const FAMILY_DATA_COLLECTION = "familyData";
const GROCERIES_COLLECTION = "groceries";
const TODOS_COLLECTION = "todos";
const BARCODES_COLLECTION = "barcodes";
const CHECKLIST_ITEMS_COLLECTION = "checkListItems";

const WEEKS_COLLECTION = "weeks";
const WEEKS_TODOS_COLLECTION = "todos";

export const createStorage = (app: firebase.app.App): Storage => {
  const storageEvents = events<StorageEvent>();

  let groceries: {
    [groceryId: string]: GroceryDTO;
  } = {};

  let todos: {
    [todoId: string]: TodoDTO;
  } = {};

  let checkListItems: {
    [itemId: string]: CheckListItemDTO;
  } = {};

  let weeks: {
    [weekId: string]: WeekDTO;
  } = {};

  let barcodes: {
    [barcodeId: string]: BarcodeDTO;
  } = {};

  const debouncedShopCount = debounce(
    (
      groceryDocRef: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>,
      shopCount: number
    ) => {
      app
        .firestore()
        .runTransaction((transaction) =>
          transaction.get(groceryDocRef).then((groceryDoc) => {
            const data = groceryDoc.data();

            if (!data) {
              return storageEvents.emit({
                type: "STORAGE:INCREASE_GROCERY_SHOP_COUNT_ERROR",
                id: groceryDocRef.id,
                error: "Document does not exist",
              });
            }

            transaction.update(groceryDocRef, {
              modified: firebase.firestore.FieldValue.serverTimestamp(),
              shopCount,
            });
          })
        )
        .catch((error) => {
          storageEvents.emit({
            type: "STORAGE:INCREASE_GROCERY_SHOP_COUNT_ERROR",
            id: groceryDocRef.id,
            error: error.messsage,
          });
        });
    },
    1000
  );

  const onSnapshot = <T extends { [id: string]: { id: string } }>(
    query: firebase.firestore.Query<firebase.firestore.DocumentData>,
    getCurrentData: () => T,
    cb: (updatedData: T) => void
  ) => {
    query.onSnapshot((snapshot) => {
      let updatedData = getCurrentData();
      snapshot.docChanges().forEach((docChange) => {
        const id = docChange.doc.id;

        switch (docChange.type) {
          case "added": {
            const data = docChange.doc.data({
              serverTimestamps: "estimate",
            });
            updatedData = {
              ...updatedData,
              [id]: {
                ...data,
                id,
                created: data.created.toMillis(),
                modified: data.modified.toMillis(),
              },
            };
            break;
          }
          case "modified": {
            const data = docChange.doc.data({
              serverTimestamps: "estimate",
            });

            updatedData = {
              ...updatedData,
              [id]: {
                ...updatedData[id],
                ...data,
                modified: data.modified.toMillis(),
                created: data.created.toMillis(),
              },
            };
            break;
          }
          case "removed": {
            updatedData = {
              ...updatedData,
            };
            delete updatedData[id];
            break;
          }
        }
      });

      cb(updatedData);
    });
  };

  return {
    events: storageEvents,
    fetchFamilyData(familyId) {
      const familyDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId);

      const groceriesCollection = familyDocRef.collection(GROCERIES_COLLECTION);
      const todosCollection = familyDocRef.collection(TODOS_COLLECTION);
      const checkListItemsCollection = familyDocRef.collection(
        CHECKLIST_ITEMS_COLLECTION
      );
      const barcodesCollection = familyDocRef.collection(BARCODES_COLLECTION);

      familyDocRef.onSnapshot((snapshot) => {
        this.events.emit({
          type: "STORAGE:FAMILY_UPDATE",
          family: {
            ...snapshot.data(),
            id: snapshot.id,
          } as FamilyDTO,
        });
      });

      onSnapshot(
        groceriesCollection,
        () => groceries,
        (updatedGroceries) => {
          groceries = updatedGroceries;
          this.events.emit({
            type: "STORAGE:GROCERIES_UPDATE",
            groceries: updatedGroceries,
          });
        }
      );

      onSnapshot(
        todosCollection,
        () => todos,
        (updatedTodos) => {
          todos = updatedTodos;

          this.events.emit({
            type: "STORAGE:TODOS_UPDATE",
            todos: updatedTodos,
          });
        }
      );

      onSnapshot(
        barcodesCollection,
        () => barcodes,
        (updatedBarcodes) => {
          barcodes = updatedBarcodes;
          this.events.emit({
            type: "STORAGE:BARCODES_UPDATE",
            barcodes: updatedBarcodes,
          });
        }
      );

      onSnapshot(
        checkListItemsCollection,
        () => checkListItems,
        (updatedCheckListItems) => {
          checkListItems = updatedCheckListItems;
          this.events.emit({
            type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
            checkListItemsByTodoId:
              createCheckListItemsByTodoId(checkListItems),
          });
        }
      );
    },

    addGrocery(familyId, name) {
      const groceriesCollection = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(GROCERIES_COLLECTION);

      const doc = groceriesCollection.doc();

      groceries = {
        ...groceries,
        [doc.id]: {
          id: doc.id,
          name,
          created: Date.now(),
          modified: Date.now(),
          shopCount: 0,
        },
      };

      this.events.emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });

      doc
        .set({
          created: firebase.firestore.FieldValue.serverTimestamp(),
          modified: firebase.firestore.FieldValue.serverTimestamp(),
          shopCount: 0,
          name,
        })
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:ADD_GROCERY_ERROR",
            name,
            error: error.message,
          });
        });
    },
    addTodo(familyId, description, metadata) {
      const todosCollection = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(TODOS_COLLECTION);
      const checkListItemsCollection = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(CHECKLIST_ITEMS_COLLECTION);
      const todoDoc = todosCollection.doc();
      const hasCheckList = Boolean(metadata?.checkList);

      todos = {
        ...todos,
        [todoDoc.id]: {
          id: todoDoc.id,
          created: Date.now(),
          modified: Date.now(),
          description,
          date: metadata?.date,
          time: metadata?.time,
          ...(hasCheckList ? { checkList: true } : undefined),
        },
      };

      this.events.emit({
        type: "STORAGE:TODOS_UPDATE",
        todos,
      });

      if (hasCheckList) {
        const checkList = metadata?.checkList!;
        const checkListItemDocs = checkList.map(() =>
          checkListItemsCollection.doc()
        );

        const newCheckListItems = checkListItemDocs.reduce<{
          [itemId: string]: CheckListItemDTO;
        }>((aggr, itemDoc, index) => {
          aggr[itemDoc.id] = {
            id: itemDoc.id,
            completed: false,
            created: Date.now(),
            modified: Date.now(),
            title: checkList[index],
            todoId: todoDoc.id,
          };
          return aggr;
        }, {});

        checkListItems = {
          ...checkListItems,
          ...newCheckListItems,
        };

        this.events.emit({
          type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
          checkListItemsByTodoId: createCheckListItemsByTodoId(checkListItems),
        });

        checkListItemDocs.forEach((doc, index) =>
          doc
            .set({
              todoId: todoDoc.id,
              title: checkList[index],
              completed: false,
              created: firebase.firestore.FieldValue.serverTimestamp(),
              modified: firebase.firestore.FieldValue.serverTimestamp(),
            })
            .catch((error) => {
              this.events.emit({
                type: "STORAGE:ADD_CHECKLIST_ITEM_ERROR",
                title: checkList[index],
                todoId: todoDoc.id,
                error: error.message,
              });
            })
        );
      }

      todoDoc
        .set({
          created: firebase.firestore.FieldValue.serverTimestamp(),
          modified: firebase.firestore.FieldValue.serverTimestamp(),
          description,
          ...(hasCheckList ? { checkList: true } : undefined),
          ...(metadata?.date ? { date: metadata?.date } : undefined),
          ...(metadata?.time ? { time: metadata?.time } : undefined),
        })
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:ADD_TODO_ERROR",
            description,
            error: error.message,
          });
        });
    },
    archiveTodo(familyId, id) {
      const todoDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(TODOS_COLLECTION)
        .doc(id);
      const checkListItemsCollection = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(CHECKLIST_ITEMS_COLLECTION);

      todos = {
        ...todos,
      };

      delete todos[id];

      this.events.emit({
        type: "STORAGE:TODOS_UPDATE",
        todos,
      });

      const checkListItemsToDelete = Object.values(checkListItems).filter(
        (checkListItem) => checkListItem.todoId === id
      );

      Promise.all(
        checkListItemsToDelete.map((checkListItem) =>
          checkListItemsCollection.doc(checkListItem.id).delete()
        )
      )
        .then(() => {
          todoDocRef.delete().catch((error) => {
            this.events.emit({
              type: "STORAGE:ARCHIVE_TODO_ERROR",
              id,
              error: error.message,
            });
          });
        })
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:ARCHIVE_TODO_ERROR",
            error: error.message,
            id,
          });
        });
    },
    deleteGrocery(familyId, id) {
      const groceryDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(GROCERIES_COLLECTION)
        .doc(id);

      groceries = {
        ...groceries,
      };

      const barcodeLinks = Object.values(barcodes).filter(
        (barcode) => barcode.groceryId === id
      );

      if (barcodeLinks.length) {
        return this.events.emit({
          type: "STORAGE:DELETE_GROCERY_ERROR",
          id,
          error: "Please unlink all barcodes first",
        });
      }

      delete groceries[id];

      this.events.emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });

      groceryDocRef.delete().catch((error) => {
        this.events.emit({
          type: "STORAGE:DELETE_GROCERY_ERROR",
          id,
          error: error.message,
        });
      });
    },
    increaseGroceryShopCount(familyId, id) {
      const groceryDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(GROCERIES_COLLECTION)
        .doc(id);

      groceries = {
        ...groceries,
        [id]: {
          ...groceries[id],
          shopCount: groceries[id].shopCount + 1,
        },
      };

      this.events.emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });

      debouncedShopCount(groceryDocRef, groceries[id].shopCount);
    },
    resetGroceryShopCount(familyId, id) {
      const groceryDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(GROCERIES_COLLECTION)
        .doc(id);

      groceries = {
        ...groceries,
        [id]: {
          ...groceries[id],
          shopCount: 0,
        },
      };

      this.events.emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });

      groceryDocRef
        .update({
          modified: firebase.firestore.FieldValue.serverTimestamp(),
          shopCount: 0,
        })
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:RESET_GROCERY_SHOP_COUNT_ERROR",
            id,
            error: error.message,
          });
        });
    },
    fetchWeeks(familyId, userId) {
      const weekIds = [
        getPreviousWeekId(),
        getCurrentWeekId(),
        getNextWeekId(),
        // We only fetch and subscribe to what we do not have as this
        // might be called multiple times
      ].filter((weekId) => !(weekId in weeks));

      const weeksCollection = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(WEEKS_COLLECTION);

      weekIds.forEach((weekId) => {
        const weekDocRef = weeksCollection.doc(weekId);

        weekDocRef.collection(WEEKS_TODOS_COLLECTION).onSnapshot((snapshot) => {
          weeks = {
            ...weeks,
            [weekId]: {
              ...weeks[weekId],
              todos: snapshot.docs.reduce<{
                [id: string]: { [userId: string]: WeekTodoActivity };
              }>((aggr, doc) => {
                const data = doc.data({ serverTimestamps: "estimate" });
                aggr[doc.id] = {
                  ...data.activityByUserId,
                  [userId]: weeks[weekId]?.todos[doc.id]?.[userId] ?? [
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                    false,
                  ],
                };

                return aggr;
              }, {}),
            },
          };

          this.events.emit({
            type: "STORAGE:WEEKS_UPDATE",
            previousWeek: weeks[getPreviousWeekId()],
            currentWeek: weeks[getCurrentWeekId()],
            nextWeek: weeks[getNextWeekId()],
          });
        });
      });

      Promise.all(
        weekIds.map((weekId) =>
          weeksCollection.doc(weekId).collection(WEEKS_TODOS_COLLECTION).get()
        )
      )
        .then((todosByWeekId) => {
          weeks = {
            ...weeks,
          };

          weekIds.forEach((weekId, index) => {
            weeks[weekId] = {
              id: weekId,
              todos: {},
            };
            todosByWeekId[index].forEach((todoDoc) => {
              weeks[weekId].todos[todoDoc.id] = todoDoc.data().activityByUserId;
            });
          });

          this.events.emit({
            type: "STORAGE:WEEKS_UPDATE",
            previousWeek: weeks[getPreviousWeekId()],
            currentWeek: weeks[getCurrentWeekId()],
            nextWeek: weeks[getNextWeekId()],
          });
        })
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:FETCH_WEEKS_ERROR",
            error: error.message,
          });
        });
    },
    setWeekTaskActivity({
      familyId,
      weekId,
      todoId,
      userId,
      weekdayIndex,
      active,
    }) {
      const todoDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(WEEKS_COLLECTION)
        .doc(weekId)
        .collection(WEEKS_TODOS_COLLECTION)
        .doc(todoId);
      const weekTodoActivity: WeekTodoActivity = weeks[weekId].todos[todoId]?.[
        userId
      ] ?? [false, false, false, false, false, false, false];

      weeks = {
        ...weeks,
        [weekId]: {
          ...weeks[weekId],
          todos: {
            ...weeks[weekId].todos,
            [todoId]: {
              ...weeks[weekId].todos[todoId],
              [userId]: [
                ...weekTodoActivity.slice(0, weekdayIndex),
                active,
                ...weekTodoActivity.slice(weekdayIndex + 1),
              ] as WeekTodoActivity,
            },
          },
        },
      };

      this.events.emit({
        type: "STORAGE:WEEKS_UPDATE",
        previousWeek: weeks[getPreviousWeekId()],
        currentWeek: weeks[getCurrentWeekId()],
        nextWeek: weeks[getNextWeekId()],
      });

      app.firestore().runTransaction((transaction) =>
        transaction.get(todoDocRef).then((todoDoc) => {
          const data = todoDoc.data();
          const weekTodoActivity: WeekTodoActivity = data?.activityByUserId[
            userId
          ] ?? [false, false, false, false, false, false, false];

          const update = {
            modified: firebase.firestore.FieldValue.serverTimestamp(),
            activityByUserId: {
              ...data?.activityByUserId,
              [userId]: [
                ...weekTodoActivity.slice(0, weekdayIndex),
                active,
                ...weekTodoActivity.slice(weekdayIndex + 1),
              ],
            },
          };

          transaction.set(todoDocRef, update);
        })
      );
    },
    linkBarcode(familyId, barcodeId, groceryId) {
      barcodes = {
        ...barcodes,
        [barcodeId]: {
          ...barcodes[barcodeId],
          groceryId,
        },
      };

      this.events.emit({
        type: "STORAGE:BARCODES_UPDATE",
        barcodes,
      });

      const barcodeDoc = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(BARCODES_COLLECTION)
        .doc(barcodeId);

      barcodeDoc
        .update({
          modified: firebase.firestore.FieldValue.serverTimestamp(),
          groceryId,
        })
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:LINK_BARCODE_ERROR",
            error: error.message,
          });
        });
    },
    unlinkBarcode(familyId, barcodeId) {
      barcodes = {
        ...barcodes,
        [barcodeId]: {
          ...barcodes[barcodeId],
          groceryId: null,
        },
      };

      this.events.emit({
        type: "STORAGE:BARCODES_UPDATE",
        barcodes,
      });

      const barcodeDoc = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(BARCODES_COLLECTION)
        .doc(barcodeId);

      barcodeDoc
        .update({
          modified: firebase.firestore.FieldValue.serverTimestamp(),
          groceryId: null,
        })
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:LINK_BARCODE_ERROR",
            error: error.message,
          });
        });
    },
    shopGrocery(familyId, id, shoppingListLength) {
      const groceryDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(GROCERIES_COLLECTION)
        .doc(id);

      const currentShoppingListLength = Object.values(groceries).filter(
        (grocery) => Boolean(grocery.shopCount)
      ).length;

      groceries = {
        ...groceries,
        [id]: {
          ...groceries[id],
          shopCount: 0,
          shopHistory: {
            ...groceries[id].shopHistory,
            [shoppingListLength]: currentShoppingListLength,
          },
        },
      };

      this.events.emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });

      app
        .firestore()
        .runTransaction((transaction) =>
          transaction.get(groceryDocRef).then((groceryDoc) => {
            const data = groceryDoc.data();

            if (!data) {
              return storageEvents.emit({
                type: "STORAGE:SHOP_GROCERY_ERROR",
                id: groceryDocRef.id,
                error: "Document does not exist",
              });
            }

            transaction.update(groceryDocRef, {
              modified: firebase.firestore.FieldValue.serverTimestamp(),
              shopCount: 0,
              shopHistory: {
                ...data.shopHistory,
                [shoppingListLength]: currentShoppingListLength,
              },
            });
          })
        )
        .catch((error) => {
          storageEvents.emit({
            type: "STORAGE:SHOP_GROCERY_ERROR",
            id: groceryDocRef.id,
            error: error.messsage,
          });
        });
    },
    addImageToGrocery(familyId, id, src) {
      const groceryDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(GROCERIES_COLLECTION)
        .doc(id);

      groceries = {
        ...groceries,
        [id]: {
          ...groceries[id],
          image: src,
        },
      };

      this.events.emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });

      groceryDocRef
        .update({
          modified: firebase.firestore.FieldValue.serverTimestamp(),
          image: src,
        })
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:ADD_IMAGE_TO_GROCERY_ERROR",
            groceryId: id,
            error: error.message,
          });
        });
    },
    addChecklistItem(familyId, todoId, title) {
      const doc = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(CHECKLIST_ITEMS_COLLECTION)
        .doc();

      checkListItems = {
        ...checkListItems,
        [doc.id]: {
          id: doc.id,
          completed: false,
          created: Date.now(),
          modified: Date.now(),
          title,
          todoId,
        },
      };

      this.events.emit({
        type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
        checkListItemsByTodoId: createCheckListItemsByTodoId(checkListItems),
      });

      doc
        .set({
          completed: false,
          created: firebase.firestore.FieldValue.serverTimestamp(),
          modified: firebase.firestore.FieldValue.serverTimestamp(),
          title,
          todoId,
        })
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:ADD_CHECKLIST_ITEM_ERROR",
            title,
            todoId,
            error: error.message,
          });
        });
    },
    deleteChecklistItem(familyId, itemId) {
      const doc = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(CHECKLIST_ITEMS_COLLECTION)
        .doc(itemId);

      checkListItems = {
        ...checkListItems,
      };

      delete checkListItems[itemId];

      this.events.emit({
        type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
        checkListItemsByTodoId: createCheckListItemsByTodoId(checkListItems),
      });

      doc.delete().catch((error) => {
        this.events.emit({
          type: "STORAGE:DELETE_CHECKLIST_ITEM_ERROR",
          itemId,
          error: error.message,
        });
      });
    },
    toggleCheckListItem(familyId, userId, itemId) {
      const doc = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(CHECKLIST_ITEMS_COLLECTION)
        .doc(itemId);

      const checkListItem = checkListItems[itemId];

      checkListItems = {
        ...checkListItems,
        [itemId]: checkListItem.completed
          ? {
              ...checkListItem,
              completed: false,
            }
          : {
              ...checkListItem,
              completed: true,
              completedByUserId: userId,
            },
      };

      this.events.emit({
        type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
        checkListItemsByTodoId: createCheckListItemsByTodoId(checkListItems),
      });

      doc
        .update(
          checkListItem.completed
            ? {
                completed: false,
                modified: firebase.firestore.FieldValue.serverTimestamp(),
              }
            : {
                completed: true,
                modified: firebase.firestore.FieldValue.serverTimestamp(),
                completedByUserId: userId,
              }
        )
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:TOGGLE_CHECKLIST_ITEM_ERROR",
            itemId,
            error: error.message,
          });
        });
    },
  };
};
