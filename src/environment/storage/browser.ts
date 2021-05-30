import firebase from "firebase";
import { events as storagEvents } from "react-states";
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

const FAMILY_DATA_COLLECTION = "familyData";
const GROCERIES_COLLECTION = "groceries";
const TODOS_COLLECTION = "todos";
const EVENTS_COLLECTION = "events";
const WEEKS_COLLECTION = "weeks";
const WEEKS_TODOS_COLLECTION = "todos";

export const createStorage = (app: firebase.app.App): Storage => {
  let groceries: {
    [groceryId: string]: GroceryDTO;
  } = {};
  let todos: {
    [todoId: string]: TodoDTO;
  } = {};
  let events: {
    [eventId: string]: CalendarEventDTO;
  };
  let weeks: {
    [id: string]: WeekDTO;
  } = {};

  function onSnapshot<T extends { [id: string]: { id: string } }>(
    query: firebase.firestore.Query<firebase.firestore.DocumentData>,
    getCurrentData: () => T,
    cb: (updatedData: T) => void
  ) {
    query.onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const id = change.doc.id;
        const docData = change.doc.data();

        switch (change.type) {
          case "added": {
            cb({
              ...getCurrentData(),
              [id]: {
                ...docData,
                id,
                created: docData.created.toMillis(),
                modified: docData.created.toMillis(),
              },
            });
            break;
          }
          case "modified": {
            cb({
              ...getCurrentData(),
              [id]: {
                id,
                created: docData.created.toMillis(),
                modified: docData.created.toMillis(),
              },
            });
            break;
          }
          case "removed": {
            const updatedData = {
              ...getCurrentData(),
            };
            delete updatedData[id];
            cb(updatedData);
            break;
          }
        }
      });
    });
  }

  return {
    events: storagEvents(),
    fetchFamilyData(familyId) {
      const familyDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId);

      const groceriesCollection = familyDocRef.collection(GROCERIES_COLLECTION);

      const todosCollection = familyDocRef.collection(TODOS_COLLECTION);
      const eventsCollection = familyDocRef.collection(EVENTS_COLLECTION);

      Promise.all([
        familyDocRef.get(),
        groceriesCollection.get(),
        todosCollection.get(),
        eventsCollection.get(),
      ]).then(([familyDataDoc, groceriesDocs, todosDocs, eventsDocs]) => {
        if (!familyDataDoc.exists) {
          return this.events.emit({
            type: "STORAGE:FETCH_FAMILY_DATA_ERROR",
            error: "Family document does not exist",
          });
        }

        const now = firebase.firestore.Timestamp.fromDate(new Date());

        onSnapshot(
          groceriesCollection.where("modified", ">", now),
          () => groceries,
          (updatedGroceries) => {
            this.events.emit({
              type: "STORAGE:GROCERIES_UPDATE",
              groceries: updatedGroceries,
            });
          }
        );

        onSnapshot(
          todosCollection.where("modified", ">", now),
          () => todos,
          (updatedTodos) => {
            this.events.emit({
              type: "STORAGE:TODOS_UPDATE",
              todos: updatedTodos,
            });
          }
        );

        onSnapshot(
          eventsCollection.where("modified", ">", now),
          () => events,
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
        const groceriesList = groceriesDocs.docs.map((groceryDoc) => ({
          id: groceryDoc.id,
          ...groceryDoc.data(),
        })) as GroceryDTO[];
        const todosList = todosDocs.docs.map((todoDoc) => ({
          id: todoDoc.id,
          ...todoDoc.data(),
        })) as TodoDTO[];
        const eventsList = eventsDocs.docs.map((eventDoc) => ({
          id: eventDoc.id,
          ...eventDoc.data(),
        })) as CalendarEventDTO[];

        const groceriesMap = groceriesList.reduce<{
          [id: string]: GroceryDTO;
        }>((aggr, grocery) => {
          aggr[grocery.id] = grocery;
          return aggr;
        }, {});
        const todosMap = todosList.reduce<{
          [id: string]: TodoDTO;
        }>((aggr, todo) => {
          aggr[todo.id] = todo;
          return aggr;
        }, {});
        const eventsMap = eventsList.reduce<{
          [id: string]: CalendarEventDTO;
        }>((aggr, event) => {
          aggr[event.id] = event;
          return aggr;
        }, {});

        this.events.emit({
          type: "STORAGE:FETCH_FAMILY_DATA_SUCCESS",
          family,
          groceries: groceriesMap,
          todos: todosMap,
          events: eventsMap,
        });
      });
    },

    addGrocery(familyId, category, name) {
      const groceriesCollection = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(GROCERIES_COLLECTION);

      groceriesCollection
        .add({
          created: firebase.firestore.FieldValue.serverTimestamp(),
          modified: firebase.firestore.FieldValue.serverTimestamp(),
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

      todosCollection
        .add({
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

      eventsCollection
        .add({
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

      app
        .firestore()
        .runTransaction((transaction) =>
          transaction.get(groceryDocRef).then((groceryDoc) => {
            const data = groceryDoc.data();

            if (!data) {
              return this.events.emit({
                type: "STORAGE:INCREASE_GROCERY_SHOP_COUNT_ERROR",
                id,
                error: "Document does not exist",
              });
            }

            transaction.update(groceryDocRef, {
              modified: firebase.firestore.FieldValue.serverTimestamp(),
              shopCount: data.shopCount + 1,
            });
          })
        )
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:INCREASE_GROCERY_SHOP_COUNT_ERROR",
            id,
            error: error.messsage,
          });
        });
    },
    resetGroceryShopCount(familyId, id) {
      const groceryDocRef = app
        .firestore()
        .collection(FAMILY_DATA_COLLECTION)
        .doc(familyId)
        .collection(GROCERIES_COLLECTION)
        .doc(id);

      groceryDocRef
        .set(
          {
            modified: firebase.firestore.FieldValue.serverTimestamp(),
            shopCount: 0,
          },
          {
            merge: true,
          }
        )
        .catch((error) => {
          this.events.emit({
            type: "STORAGE:RESET_GROCERY_SHOP_COUNT_ERROR",
            id,
            error: error.message,
          });
        });
    },
    fetchWeeks(familyId) {
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
          .where(
            "modified",
            ">",
            firebase.firestore.Timestamp.fromDate(new Date())
          )
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
                        [id]: data.activityByUserId,
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
                        [id]: data.activityByUserId,
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
