import firebase from "firebase";
import { events } from "react-states";
import {
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
    [barcodeId: string]: string | null;
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
    cb: (updatedData: T, docId: string) => void
  ) {
    query.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        const docData = change.doc.data();

        switch (change.type) {
          case "added": {
            cb(
              {
                ...getCurrentData(),
                [id]: {
                  ...docData,
                  id,
                  created: docData.created.toMillis(),
                  modified: docData.modified.toMillis(),
                },
              },
              id
            );
            break;
          }
          case "modified": {
            cb(
              {
                ...getCurrentData(),
                [id]: {
                  ...docData,
                  id,
                  modified: docData.modified.toMillis(),
                },
              },
              id
            );
            break;
          }
          case "removed": {
            const updatedData = {
              ...getCurrentData(),
            };
            delete updatedData[id];
            cb(updatedData, id);
            break;
          }
        }
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
      ]).then(([familyDataDoc, groceriesDocs, todosDocs, eventsDocs]) => {
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
          (updatedGroceries, groceryId) => {
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
            this.events.emit({
              type: "STORAGE:EVENTS_UPDATE",
              events: updatedEvents,
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

        this.events.emit({
          type: "STORAGE:FETCH_FAMILY_DATA_SUCCESS",
          family,
          groceries,
          todos,
          events: calendarEvents,
        });
      });
    },

    addGrocery(familyId, category, name) {
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
          category,
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
          category,
          name,
        })
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:ADD_GROCERY_ERROR",
            category,
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
            snapshot.docChanges().forEach((change) => {
              const id = change.doc.id;
              const data = change.doc.data();

              switch (change.type) {
                case "added": {
                  weeks = {
                    ...weeks,
                    [weekId]: {
                      ...weeks[weekId],
                      todos: {
                        ...weeks[weekId].todos,
                        [id]: {
                          ...data.activityByUserId,
                          [userId]: weeks[weekId].todos[id][userId],
                        },
                      },
                    },
                  };
                  break;
                }
                case "modified": {
                  weeks = {
                    ...weeks,
                    [weekId]: {
                      ...weeks[weekId],
                      todos: {
                        ...weeks[weekId].todos,
                        [id]: {
                          ...data.activityByUserId,
                          [userId]: weeks[weekId].todos[id][userId],
                        },
                      },
                    },
                  };
                  break;
                }
                case "removed": {
                  // This never happens
                  break;
                }
              }

              this.events.emit({
                type: "STORAGE:WEEKS_UPDATE",
                previousWeek: weeks[getPreviousWeekId()],
                currentWeek: weeks[getCurrentWeekId()],
                nextWeek: weeks[getNextWeekId()],
              });
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

      weeks = {
        ...weeks,
        [weekId]: {
          ...weeks[weekId],
          todos: {
            ...weeks[weekId].todos,
            [todoId]: {
              ...weeks[weekId].todos[todoId],
              [userId]: [
                ...weeks[weekId].todos[todoId][userId].slice(0, weekdayIndex),
                active,
                ...weeks[weekId].todos[todoId][userId].slice(weekdayIndex + 1),
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
  };
};
