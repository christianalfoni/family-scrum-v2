import firebase from "firebase/app";
import {
  CheckListItemDTO,
  FamilyDTO,
  GroceryDTO,
  Storage,
  TodoDTO,
  WeekDTO,
  WeekTodoActivity,
  StorageEvent,
  DinnerDTO,
  WeekDinnersDTO,
} from "../../environment-interface/storage";
import {
  getCurrentWeekId,
  getNextWeekId,
  getPreviousWeekId,
} from "../../utils";
import { createCheckListItemsByTodoId } from "./utils";
import { TEmit } from "react-environment-interface";

const FAMILY_DATA_COLLECTION = "familyData";
const GROCERIES_COLLECTION = "groceries";
const TODOS_COLLECTION = "todos";
const CHECKLIST_ITEMS_COLLECTION = "checkListItems";
const DINNERS_COLLECTION = "dinners";

const WEEKS_COLLECTION = "weeks";
const WEEKS_TODOS_COLLECTION = "todos";

export const createStorage = (
  emit: TEmit<StorageEvent>,
  app: firebase.app.App
): Storage => {
  firebase.firestore().settings({
    ignoreUndefinedProperties: true,
  });

  let groceries: {
    [groceryId: string]: GroceryDTO;
  } = {};

  let todos: Record<string, TodoDTO> = {};

  let checkListItems: Record<string, CheckListItemDTO> = {};

  let weeks: Record<string, WeekDTO> = {};

  let dinners: Record<string, DinnerDTO> = {};

  let images: Record<string, string> = {};

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
                created: data.created.toMillis?.() ?? data.created,
                modified: data.modified.toMillis?.() ?? data.modified,
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
                modified: data.modified.toMillis?.() ?? data.modified,
                created: data.created.toMillis?.() ?? data.created,
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

  let getFamilyDoc =
    (): firebase.firestore.DocumentReference<firebase.firestore.DocumentData> => {
      throw new Error("No family collection configured");
    };

  return {
    configureFamilyCollection(familyId) {
      getFamilyDoc = () => {
        return app.firestore().collection(FAMILY_DATA_COLLECTION).doc(familyId);
      };
    },
    createCheckListItemId() {
      return getFamilyDoc().collection(CHECKLIST_ITEMS_COLLECTION).doc().id;
    },
    createDinnerId() {
      return getFamilyDoc().collection(DINNERS_COLLECTION).doc().id;
    },
    createGroceryId() {
      return getFamilyDoc().collection(GROCERIES_COLLECTION).doc().id;
    },
    createTodoId() {
      return getFamilyDoc().collection(TODOS_COLLECTION).doc().id;
    },
    getDinnerImageRef(id) {
      return `dinners/${id}`;
    },
    deleteDinner(id) {
      const dinner = dinners[id];

      dinners = {
        ...dinners,
      };

      delete dinners[id];

      emit({
        type: "STORAGE:DINNERS_UPDATE",
        dinners,
      });

      getFamilyDoc()
        .collection(DINNERS_COLLECTION)
        .doc(id)
        .delete()
        .catch(() => {
          emit({
            type: "STORAGE:DELETE_DINNER_ERROR",
            dinner,
          });
        });
    },
    fetchImage(ref) {
      if (images[ref]) {
        emit({
          type: "STORAGE:FETCH_IMAGE_SUCCESS",
          ref,
          src: images[ref],
        });
        return;
      }

      app
        .storage()
        .ref(ref + ".png")
        .getDownloadURL()
        .then((src) => {
          images[ref] = src;
          emit({
            type: "STORAGE:FETCH_IMAGE_SUCCESS",
            ref,
            src,
          });
        })
        .catch((error) => {
          emit({
            type: "STORAGE:FETCH_IMAGE_ERROR",
            ref,
            error: error.message,
          });
        });
    },
    setWeekDinner({ dinnerId, weekId, weekdayIndex }) {
      const week = weeks[weekId];
      const updatedWeek: WeekDTO = {
        ...week,
        dinners: [
          ...week.dinners.slice(0, weekdayIndex),
          dinnerId,
          ...week.dinners.slice(weekdayIndex + 1),
        ] as WeekDinnersDTO,
      };

      weeks = {
        ...weeks,
        [weekId]: updatedWeek,
      };

      emit({
        type: "STORAGE:WEEKS_UPDATE",
        currentWeek: weeks[getCurrentWeekId()],
        nextWeek: weeks[getNextWeekId()],
        previousWeek: weeks[getPreviousWeekId()],
      });
      const { dinners } = updatedWeek;
      getFamilyDoc()
        .collection(WEEKS_COLLECTION)
        .doc(weekId)
        .set(
          {
            dinners,
          },
          {
            merge: true,
          }
        )
        .catch((error) => {
          emit({
            type: "STORAGE:SET_WEEK_DINNER_ERROR",
            error: error.message,
            weekId,
          });
        });
    },
    storeDinner(
      { id, description, groceries, instructions, name, preparationCheckList },
      imageSrc
    ) {
      const dinner: DinnerDTO = dinners[id]
        ? {
            ...dinners[id],
            name,
            description,
            groceries,
            instructions,
            preparationCheckList,
            modified: Date.now(),
          }
        : {
            id,
            description,
            groceries,
            instructions,
            name,
            preparationCheckList,
            created: Date.now(),
            modified: Date.now(),
          };

      dinners = {
        ...dinners,
        [id]: dinner,
      };

      emit({
        type: "STORAGE:DINNERS_UPDATE",
        dinners,
      });

      const { id: _, ...data } = dinner;

      getFamilyDoc()
        .collection(DINNERS_COLLECTION)
        .doc(id)
        .set(data)
        .catch(() => {
          emit({
            type: "STORAGE:STORE_DINNER_ERROR",
            dinner,
          });
        });

      if (imageSrc) {
        const imageRef = this.getDinnerImageRef(id);

        images[imageRef] = imageSrc;

        app
          .storage()
          .ref(imageRef + ".png")
          .putString(imageSrc, "data_url")
          .then(() => {
            emit({
              type: "STORAGE:STORE_IMAGE_SUCCESS",
              ref: imageRef,
            });
          })
          .catch((error) => {
            emit({
              type: "STORAGE:STORE_IMAGE_ERROR",
              error: error.message,
              ref: imageRef,
            });
          });
      }
    },
    fetchFamilyData() {
      const groceriesCollection =
        getFamilyDoc().collection(GROCERIES_COLLECTION);
      const todosCollection = getFamilyDoc().collection(TODOS_COLLECTION);
      const checkListItemsCollection = getFamilyDoc().collection(
        CHECKLIST_ITEMS_COLLECTION
      );
      const dinnerCollection = getFamilyDoc().collection(DINNERS_COLLECTION);

      getFamilyDoc().onSnapshot((snapshot) => {
        emit({
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
          emit({
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

          emit({
            type: "STORAGE:TODOS_UPDATE",
            todos: updatedTodos,
          });
        }
      );

      onSnapshot(
        checkListItemsCollection,
        () => checkListItems,
        (updatedCheckListItems) => {
          checkListItems = updatedCheckListItems;
          emit({
            type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
            checkListItemsByTodoId:
              createCheckListItemsByTodoId(checkListItems),
          });
        }
      );

      onSnapshot(
        dinnerCollection,
        () => dinners,
        (updatedDinners) => {
          dinners = updatedDinners;
          emit({
            type: "STORAGE:DINNERS_UPDATE",
            dinners,
          });
        }
      );
    },

    storeGrocery({ id, name, dinnerId }) {
      const groceriesCollection =
        getFamilyDoc().collection(GROCERIES_COLLECTION);

      const grocery: GroceryDTO = groceries[id]
        ? {
            ...groceries[id],
            name,
            modified: Date.now(),
            dinnerId,
          }
        : {
            id,
            name,
            created: Date.now(),
            modified: Date.now(),
            dinnerId,
          };

      groceries = {
        ...groceries,
        [id]: grocery,
      };

      emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });

      const { id: _, ...data } = grocery;

      groceriesCollection
        .doc(id)
        .set(data)
        .catch(() => {
          emit({
            type: "STORAGE:STORE_GROCERY_ERROR",
            grocery,
          });
        });
    },
    storeTodo({ id, description, date, time }, checkList) {
      const todosCollection = getFamilyDoc().collection(TODOS_COLLECTION);
      const checkListItemsCollection = getFamilyDoc().collection(
        CHECKLIST_ITEMS_COLLECTION
      );

      const todo: TodoDTO = todos[id]
        ? {
            ...todos[id],
            modified: Date.now(),
            description,
            date,
            time,
            checkList: Boolean(checkList),
          }
        : {
            id,
            created: Date.now(),
            modified: Date.now(),
            description,
            date,
            time,
            checkList: Boolean(checkList),
          };

      todos = {
        ...todos,
        [id]: todo,
      };

      emit({
        type: "STORAGE:TODOS_UPDATE",
        todos,
      });

      if (checkList) {
        const changedCheckListItems = checkList.filter(
          (item) =>
            !checkListItems[item.id] || checkListItems[id].title === item.title
        );
        checkListItems = changedCheckListItems.reduce<{
          [itemId: string]: CheckListItemDTO;
        }>(
          (aggr, item, index) => {
            const checkListItem: CheckListItemDTO = aggr[item.id]
              ? {
                  ...aggr[item.id],
                  modified: Date.now(),
                  title: checkList[index].title,
                }
              : {
                  id: item.id,
                  completed: false,
                  created: Date.now(),
                  modified: Date.now(),
                  title: checkList[index].title,
                  todoId: id,
                };

            aggr[item.id] = checkListItem;

            return aggr;
          },
          {
            ...checkListItems,
          }
        );

        emit({
          type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
          checkListItemsByTodoId: createCheckListItemsByTodoId(checkListItems),
        });

        changedCheckListItems.forEach((item, index) => {
          const { id, ...data } = checkListItems[item.id];

          checkListItemsCollection
            .doc(id)
            .set(data)
            .catch((error) => {
              emit({
                type: "STORAGE:ADD_CHECKLIST_ITEM_ERROR",
                error: error.message,
                title: item.title,
                todoId: id,
              });
            });
        });
      }

      const { id: _, ...data } = todo;

      todosCollection
        .doc(id)
        .set(data)
        .catch((error) => {
          emit({
            type: "STORAGE:STORE_TODO_ERROR",
            todo,
          });
        });
    },
    archiveTodo(id) {
      const todoDocRef = getFamilyDoc().collection(TODOS_COLLECTION).doc(id);
      const checkListItemsCollection = getFamilyDoc().collection(
        CHECKLIST_ITEMS_COLLECTION
      );

      todos = {
        ...todos,
      };

      delete todos[id];

      emit({
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
            emit({
              type: "STORAGE:ARCHIVE_TODO_ERROR",
              id,
              error: error.message,
            });
          });
        })
        .catch((error) => {
          emit({
            type: "STORAGE:ARCHIVE_TODO_ERROR",
            error: error.message,
            id,
          });
        });
    },
    deleteGrocery(id) {
      const groceryDocRef = getFamilyDoc()
        .collection(GROCERIES_COLLECTION)
        .doc(id);

      groceries = {
        ...groceries,
      };

      delete groceries[id];

      emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });

      groceryDocRef.delete().catch((error) => {
        emit({
          type: "STORAGE:DELETE_GROCERY_ERROR",
          id,
          error: error.message,
        });
      });
    },
    fetchWeeks(userId) {
      const weekIds = [
        getPreviousWeekId(),
        getCurrentWeekId(),
        getNextWeekId(),
        // We only fetch and subscribe to what we do not have as this
        // might be called multiple times
      ].filter((weekId) => !(weekId in weeks));

      const weeksCollection = getFamilyDoc().collection(WEEKS_COLLECTION);

      weekIds.forEach((weekId) => {
        const weekDocRef = weeksCollection.doc(weekId);

        weekDocRef.onSnapshot((snapshot) => {
          weeks = {
            ...weeks,
            [weekId]: {
              ...weeks[weekId],
              id: weekId,
              dinners: snapshot.data()?.dinners ?? [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
              ],
              todos: weeks[weekId]?.todos ?? {},
            },
          };

          emit({
            type: "STORAGE:WEEKS_UPDATE",
            previousWeek: weeks[getPreviousWeekId()],
            currentWeek: weeks[getCurrentWeekId()],
            nextWeek: weeks[getNextWeekId()],
          });
        });

        weekDocRef.collection(WEEKS_TODOS_COLLECTION).onSnapshot((snapshot) => {
          weeks = {
            ...weeks,
            [weekId]: {
              ...weeks[weekId],
              id: weekId,
              dinners: weeks[weekId]?.dinners ?? [
                null,
                null,
                null,
                null,
                null,
                null,
                null,
              ],
              todos: snapshot.docs.reduce<{
                [id: string]: { [userId: string]: WeekTodoActivity };
              }>((aggr, doc) => {
                const data = doc.data({ serverTimestamps: "estimate" });
                aggr[doc.id] = {
                  ...data.activityByUserId,
                  // If other users are updated, we want to keep a reference to our optimistic version
                  [userId]:
                    weeks[weekId]?.todos[doc.id]?.[userId] ??
                    (data.activityByUserId[userId] || [
                      false,
                      false,
                      false,
                      false,
                      false,
                      false,
                      false,
                    ]),
                };

                return aggr;
              }, {}),
            },
          };

          emit({
            type: "STORAGE:WEEKS_UPDATE",
            previousWeek: weeks[getPreviousWeekId()],
            currentWeek: weeks[getCurrentWeekId()],
            nextWeek: weeks[getNextWeekId()],
          });
        });
      });
    },
    setWeekTaskActivity({ weekId, todoId, userId, weekdayIndex, active }) {
      const todoDocRef = getFamilyDoc()
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

      emit({
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
    addChecklistItem({ id, todoId, title }) {
      const item: CheckListItemDTO = {
        id: id,
        completed: false,
        created: Date.now(),
        modified: Date.now(),
        title,
        todoId,
      };
      checkListItems = {
        ...checkListItems,
        [id]: item,
      };

      emit({
        type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
        checkListItemsByTodoId: createCheckListItemsByTodoId(checkListItems),
      });

      const { id: _, ...data } = item;
      getFamilyDoc()
        .collection(CHECKLIST_ITEMS_COLLECTION)
        .doc(id)
        .set(data)
        .catch((error) => {
          emit({
            type: "STORAGE:ADD_CHECKLIST_ITEM_ERROR",
            title,
            todoId,
            error: error.message,
          });
        });
    },
    deleteChecklistItem(itemId) {
      const doc = getFamilyDoc()
        .collection(CHECKLIST_ITEMS_COLLECTION)
        .doc(itemId);

      checkListItems = {
        ...checkListItems,
      };

      delete checkListItems[itemId];

      emit({
        type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
        checkListItemsByTodoId: createCheckListItemsByTodoId(checkListItems),
      });

      doc.delete().catch((error) => {
        emit({
          type: "STORAGE:DELETE_CHECKLIST_ITEM_ERROR",
          itemId,
          error: error.message,
        });
      });
    },
    toggleCheckListItem(userId, itemId) {
      const doc = getFamilyDoc()
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

      emit({
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
          emit({
            type: "STORAGE:TOGGLE_CHECKLIST_ITEM_ERROR",
            itemId,
            error: error.message,
          });
        });
    },
  };
};
