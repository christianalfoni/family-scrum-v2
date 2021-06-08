import firebase from "firebase/app";
import { events } from "react-states";
import {
  BarcodeDTO,
  CalendarEventDTO,
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

const FAMILY_DATA_COLLECTION = "familyData";
const GROCERIES_COLLECTION = "groceries";
const TODOS_COLLECTION = "todos";
const EVENTS_COLLECTION = "events";
const BARCODES_COLLECTION = "barcodes";

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

  let calendarEvents: {
    [eventId: string]: CalendarEventDTO;
  };

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

  function onSnapshot<T extends { [id: string]: { id: string } }>(
    query: firebase.firestore.Query<firebase.firestore.DocumentData>,
    getCurrentData: () => T,
    cb: (updatedData: T) => void
  ) {
    query.onSnapshot((snapshot) => {
      if (!snapshot.docs.length) {
        return;
      }

      cb({
        ...getCurrentData(),
        ...snapshot.docs.reduce((aggr, doc) => {
          const data = doc.data({ serverTimestamps: "estimate" });
          aggr[doc.id] = {
            ...data,
            id: doc.id,
            modified: data.modified.toMillis(),
            created: data.created.toMillis(),
          };

          return aggr;
        }, {} as any),
      });
    });
  }

  return {
    events: storageEvents,
    fetchFamilyData(familyId) {
      const familyDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId);

      const groceriesCollection = familyDocRef.collection(GROCERIES_COLLECTION);
      const todosCollection = familyDocRef.collection(TODOS_COLLECTION);
      const eventsCollection = familyDocRef.collection(EVENTS_COLLECTION);
      const barcodesCollection = familyDocRef.collection(BARCODES_COLLECTION);

      Promise.all([
        familyDocRef.get(),
        groceriesCollection.get(),
        todosCollection.get(),
        eventsCollection.get(),
        barcodesCollection.get(),
      ]).then(
        ([
          familyDataDoc,
          groceriesDocs,
          todosDocs,
          eventsDocs,
          barcodesDocs,
        ]) => {
          if (!familyDataDoc.exists) {
            return this.events.emit({
              type: "STORAGE:FETCH_FAMILY_DATA_ERROR",
              error: "Family document does not exist",
            });
          }

          onSnapshot(
            groceriesCollection.where(
              "modified",
              ">",
              firebase.firestore.Timestamp.now()
            ),
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
            todosCollection.where(
              "modified",
              ">",
              firebase.firestore.Timestamp.now()
            ),
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
            eventsCollection.where(
              "modified",
              ">",
              firebase.firestore.Timestamp.now()
            ),
            () => calendarEvents,
            (updatedEvents) => {
              calendarEvents = updatedEvents;
              this.events.emit({
                type: "STORAGE:EVENTS_UPDATE",
                events: updatedEvents,
              });
            }
          );

          onSnapshot(
            barcodesCollection.where(
              "modified",
              ">",
              firebase.firestore.Timestamp.now()
            ),
            () => barcodes,
            (updatedBarcodes) => {
              barcodes = updatedBarcodes;
              this.events.emit({
                type: "STORAGE:BARCODES_UPDATE",
                barcodes: updatedBarcodes,
              });
            }
          );

          const family = {
            ...familyDataDoc.data(),
            id: familyDataDoc.id,
          } as FamilyDTO;
          const groceriesList = groceriesDocs.docs.map((groceryDoc) => {
            const data = groceryDoc.data();

            return {
              id: groceryDoc.id,
              ...data,
              created: data.created.toMillis(),
              modified: data.modified.toMillis(),
            };
          }) as GroceryDTO[];
          const todosList = todosDocs.docs.map((todoDoc) => {
            const data = todoDoc.data();

            return {
              id: todoDoc.id,
              ...data,
              created: data.created.toMillis(),
              modified: data.created.toMillis(),
            };
          }) as TodoDTO[];
          const eventsList = eventsDocs.docs.map((eventDoc) => {
            const data = eventDoc.data();

            return {
              id: eventDoc.id,
              ...data,
              created: data.created.toMillis(),
              modified: data.modified.toMillis(),
            };
          }) as CalendarEventDTO[];
          const barcodesList = barcodesDocs.docs.map((barcodeDoc) => {
            const data = barcodeDoc.data();

            return {
              id: barcodeDoc.id,
              ...data,
              created: data.created.toMillis(),
            };
          }) as BarcodeDTO[];

          groceries = groceriesList.reduce<{
            [id: string]: GroceryDTO;
          }>((aggr, grocery) => {
            aggr[grocery.id] = grocery;
            return aggr;
          }, {});
          todos = todosList.reduce<{
            [id: string]: TodoDTO;
          }>((aggr, todo) => {
            aggr[todo.id] = todo;
            return aggr;
          }, {});
          calendarEvents = eventsList.reduce<{
            [id: string]: CalendarEventDTO;
          }>((aggr, event) => {
            aggr[event.id] = event;
            return aggr;
          }, {});
          barcodes = barcodesList.reduce<{
            [id: string]: BarcodeDTO;
          }>((aggr, event) => {
            aggr[event.id] = event;
            return aggr;
          }, {});

          this.events.emit({
            type: "STORAGE:FETCH_FAMILY_DATA_SUCCESS",
            family,
            groceries,
            todos,
            events: calendarEvents,
            barcodes,
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
    addTodo(familyId, description) {
      const todosCollection = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(TODOS_COLLECTION);

      const doc = todosCollection.doc();

      todos = {
        ...todos,
        [doc.id]: {
          id: doc.id,
          created: Date.now(),
          modified: Date.now(),
          description,
        },
      };

      this.events.emit({
        type: "STORAGE:TODOS_UPDATE",
        todos,
      });

      doc
        .set({
          created: firebase.firestore.FieldValue.serverTimestamp(),
          modified: firebase.firestore.FieldValue.serverTimestamp(),
          description,
        })
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:ADD_TODO_ERROR",
            description,
            error: error.message,
          });
        });
    },
    addEvent(familyId, userId, description, date) {
      const eventsCollection = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(EVENTS_COLLECTION);

      const doc = eventsCollection.doc();

      calendarEvents = {
        ...calendarEvents,
        [doc.id]: {
          id: doc.id,
          created: Date.now(),
          modified: Date.now(),
          date,
          description,
          userIds: [userId],
        },
      };

      this.events.emit({
        type: "STORAGE:EVENTS_UPDATE",
        events: calendarEvents,
      });

      doc
        .set({
          created: firebase.firestore.FieldValue.serverTimestamp(),
          modified: firebase.firestore.FieldValue.serverTimestamp(),
          date,
          description,
          userIds: [userId],
        })
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:ADD_EVENT_ERROR",
            date,
            description,
            userId,
            error: error.message,
          });
        });
    },
    toggleEventParticipation(familyId, eventId, userId) {
      const eventDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(EVENTS_COLLECTION)
        .doc(eventId);

      calendarEvents = {
        ...calendarEvents,
        [eventId]: {
          ...calendarEvents[eventId],
          userIds: calendarEvents[eventId].userIds.includes(userId)
            ? calendarEvents[eventId].userIds.filter((id) => id !== userId)
            : calendarEvents[eventId].userIds.concat(userId),
        },
      };

      this.events.emit({
        type: "STORAGE:EVENTS_UPDATE",
        events: calendarEvents,
      });

      app
        .firestore()
        .runTransaction((transaction) =>
          transaction.get(eventDocRef).then((eventDoc) => {
            const data = eventDoc.data();

            if (!data) {
              return this.events.emit({
                type: "STORAGE:TOGGLE_EVENT_PARTICIPATION_ERROR",
                eventId,
                userId,
                error: "Document does not exist",
              });
            }

            transaction.update(eventDocRef, {
              modified: firebase.firestore.FieldValue.serverTimestamp(),
              userIds: data.userIds.includes(userId)
                ? data.userIds.filter((id: string) => id !== userId)
                : data.userIds.concat(userId),
            });
          })
        )
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:TOGGLE_EVENT_PARTICIPATION_ERROR",
            eventId,
            userId,
            error: error.messsage,
          });
        });
    },
    archiveEvent(familyId, id) {
      const eventDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(EVENTS_COLLECTION)
        .doc(id);

      calendarEvents = {
        ...calendarEvents,
      };

      delete calendarEvents[id];

      this.events.emit({
        type: "STORAGE:EVENTS_UPDATE",
        events: calendarEvents,
      });

      eventDocRef.delete().catch((error) => {
        this.events.emit({
          type: "STORAGE:ARCHIVE_EVENT_ERROR",
          id,
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

      todos = {
        ...todos,
      };

      delete todos[id];

      this.events.emit({
        type: "STORAGE:TODOS_UPDATE",
        todos,
      });

      todoDocRef.delete().catch((error) => {
        this.events.emit({
          type: "STORAGE:ARCHIVE_TODO_ERROR",
          id,
          error: error.message,
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
        // We only fetch and subscribe to what we do not have
      ].filter((weekId) => !(weekId in weeks));

      const weeksCollection = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(WEEKS_COLLECTION);

      weekIds.forEach((weekId) => {
        const weekDocRef = weeksCollection.doc(weekId);

        weekDocRef
          .collection(WEEKS_TODOS_COLLECTION)
          .where("modified", ">", firebase.firestore.Timestamp.now())
          .onSnapshot((snapshot) => {
            if (!snapshot.docs.length) {
              return;
            }

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
                    [userId]: weeks[weekId].todos[doc.id]?.[userId],
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
  };
};
