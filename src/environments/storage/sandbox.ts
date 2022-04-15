import { Emit } from "react-states";
import {
  GroceryDTO,
  Storage,
  WeekDTO,
  TodoDTO,
  FamilyDTO,
  CheckListItemDTO,
  WeekTodoActivity,
  DinnerDTO,
  StorageEvent,
} from "../../environment-interface/storage";
import {
  getCurrentWeekId,
  getNextWeekId,
  getPreviousWeekId,
} from "../../utils";
import { randomWait } from "../utils";
import { createCheckListItemsByTodoId } from "./utils";

export const createStorage = (emit: Emit<StorageEvent>): Storage => {
  const family: FamilyDTO = {
    id: "456",
    users: {
      user_1: {
        name: "Bob Saget",
        avatar:
          "data:image/jpeg;base64,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",
      },
      user_2: {
        name: "Kate Winslet",
        avatar:
          "data:image/jpeg;base64,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",
      },
    },
  };

  let dinners: {
    [dinnerId: string]: DinnerDTO;
  } = {
    dinner_0: {
      id: "dinner_0",
      created: Date.now(),
      modified: Date.now(),
      description: "Pretty nice dinner",
      groceries: [],
      instructions: ["Do this"],
      name: "Our awesomest dinner",
      preparationCheckList: ["Pre this"],
    },
  };

  let groceries: {
    [groceryId: string]: GroceryDTO;
  } = {
    grocery_0: {
      id: "grocery_0",
      created: Date.now(),
      modified: Date.now(),
      name: "Gryn",
    },
  };

  let checkListItems: {
    [itemId: string]: CheckListItemDTO;
  } = {
    checklist_item_0: {
      id: "checklist_item_0",
      todoId: "todo_2",
      completed: false,
      title: "Do this",
      created: Date.now(),
      modified: Date.now(),
    },
    checklist_item_1: {
      id: "checklist_item_1",
      todoId: "todo_2",
      completed: true,
      title: "Do that",
      completedByUserId: "user_1",
      created: Date.now(),
      modified: Date.now(),
    },
  };

  let todos: {
    [todoId: string]: TodoDTO;
  } = {
    todo_0: {
      id: "todo_0",
      created: Date.now(),
      modified: Date.now(),
      description: "Do something cool",
    },
    todo_1: {
      id: "todo_1",
      created: Date.now(),
      modified: Date.now(),
      description: "Do something else",
      date: Date.now(),
      time: "13:00",
    },
    todo_2: {
      id: "todo_2",
      created: Date.now(),
      modified: Date.now(),
      description: "Do some listing",
      checkList: true,
    },
  };

  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();

  let weeks: {
    [id: string]: WeekDTO;
  } = {
    [previousWeekId]: {
      id: previousWeekId,
      todos: {
        todo_0: {
          user_1: [true, false, false, false, false, false, false],
          user_2: [false, false, false, true, false, false, false],
        },
        todo_1: {
          user_1: [false, false, false, false, true, false, false],
          user_2: [false, true, true, false, false, false, false],
        },
      },
      dinners: [null, null, null, null, null, null, null],
    },
    [currentWeekId]: {
      id: currentWeekId,
      todos: {
        todo_0: {
          user_2: [false, false, false, false, true, false, false],
        },
        todo_1: {
          user_1: [false, false, false, false, false, true, false],
          user_2: [false, true, false, false, false, true, false],
        },
      },
      dinners: [null, null, null, null, "dinner_0", null, null],
    },
    [nextWeekId]: {
      id: nextWeekId,
      todos: {
        todo_0: {
          user_1: [false, false, false, false, false, false, false],
          user_2: [false, false, false, false, false, false, false],
        },
        todo_1: {
          user_1: [false, false, false, false, false, false, false],
          user_2: [false, false, false, false, false, false, false],
        },
      },
      dinners: ["dinner_0", null, null, null, null, null, null],
    },
  };

  return {
    configureFamilyCollection() {},
    async fetchWeeks() {
      emit({
        type: "STORAGE:WEEKS_UPDATE",
        currentWeek: weeks[currentWeekId],
        nextWeek: weeks[nextWeekId],
        previousWeek: weeks[previousWeekId],
      });
    },
    storeDinner({
      id,
      description,
      groceries,
      instructions,
      name,
      preparationCheckList,
    }) {
      dinners = {
        ...dinners,
        [id]: dinners[id]
          ? {
              ...dinners[id],
              modified: Date.now(),
              description,
              groceries,
              instructions,
              name,
              preparationCheckList,
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
            },
      };

      emit({
        type: "STORAGE:DINNERS_UPDATE",
        dinners,
      });
    },
    deleteDinner(id) {
      delete dinners[id];

      dinners = {
        ...dinners,
      };

      emit({ type: "STORAGE:DINNERS_UPDATE", dinners });
    },
    storeGrocery({ id, name, dinnerId }) {
      groceries = {
        ...groceries,
        [id]: groceries[id]
          ? {
              ...groceries[id],
              modified: Date.now(),
              name,
            }
          : {
              id,
              name,
              created: Date.now(),
              modified: Date.now(),
              dinnerId,
            },
      };

      emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });
    },
    createTodoId() {
      return `todo_${Object.keys(todos).length}`;
    },
    createCheckListItemId() {
      return `checklist_item_${Object.keys(checkListItems).length}`;
    },
    createDinnerId() {
      return `dinner_${Object.keys(dinners).length}`;
    },
    createGroceryId() {
      return `grocery_${Object.keys(groceries).length}`;
    },
    storeTodo({ id, description, date, time }, checkList) {
      todos = {
        ...todos,
        [id]: todos[id]
          ? {
              ...todos[id],
              description,
              date,
              time,
              modified: Date.now(),
            }
          : {
              id,
              description,
              created: Date.now(),
              modified: Date.now(),
              date,
              time,
              checkList: Boolean(checkList && checkList.length),
            },
      };

      emit({
        type: "STORAGE:TODOS_UPDATE",
        todos,
      });

      if (checkList) {
        const todoId = id;
        const newCheckListItems = checkList.reduce<{
          [itemId: string]: CheckListItemDTO;
        }>((aggr, { id, title }) => {
          aggr[id] = checkListItems[id]
            ? {
                ...checkListItems[id],
                modified: Date.now(),
                title,
              }
            : {
                id,
                created: Date.now(),
                modified: Date.now(),
                title,
                completed: false,
                todoId,
              };

          return aggr;
        }, {});

        checkListItems = {
          ...checkListItems,
          ...newCheckListItems,
        };

        emit({
          type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
          checkListItemsByTodoId: createCheckListItemsByTodoId(checkListItems),
        });
      }
    },
    deleteGrocery(id) {
      delete groceries[id];

      groceries = {
        ...groceries,
      };

      emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });
    },
    async fetchFamilyData() {
      await randomWait();
      emit({
        type: "STORAGE:FAMILY_UPDATE",
        family,
      });
      emit({
        type: "STORAGE:GROCERIES_UPDATE",
        groceries,
      });
      emit({
        type: "STORAGE:TODOS_UPDATE",
        todos,
      });
      emit({
        type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
        checkListItemsByTodoId: createCheckListItemsByTodoId(checkListItems),
      });
      emit({
        type: "STORAGE:DINNERS_UPDATE",
        dinners,
      });
    },
    archiveTodo(id) {
      todos = {
        ...todos,
      };

      delete todos[id];

      emit({
        type: "STORAGE:TODOS_UPDATE",
        todos,
      });
    },

    setWeekTaskActivity({ weekId, userId, todoId, weekdayIndex, active }) {
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
        currentWeek: weeks[currentWeekId],
        nextWeek: weeks[nextWeekId],
        previousWeek: weeks[previousWeekId],
      });
    },
    toggleCheckListItem(userId, itemId) {
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
    },
    deleteChecklistItem(itemId) {
      checkListItems = {
        ...checkListItems,
      };

      delete checkListItems[itemId];

      emit({
        type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
        checkListItemsByTodoId: createCheckListItemsByTodoId(checkListItems),
      });
    },
    storeChecklistItem({ id, title, todoId }) {
      checkListItems = {
        ...checkListItems,
        [id]: checkListItems[id]
          ? {
              ...checkListItems[id],
              modified: Date.now(),
              title,
            }
          : {
              id,
              todoId,
              completed: false,
              title,
              created: Date.now(),
              modified: Date.now(),
            },
      };

      emit({
        type: "STORAGE:CHECKLIST_ITEMS_UPDATE",
        checkListItemsByTodoId: createCheckListItemsByTodoId(checkListItems),
      });
    },
    setWeekDinner({ weekId, weekdayIndex, dinnerId }) {
      weeks[weekId].dinners[weekdayIndex] = dinnerId || null;
      emit({
        type: "STORAGE:WEEKS_UPDATE",
        currentWeek: weeks[currentWeekId],
        nextWeek: weeks[nextWeekId],
        previousWeek: weeks[previousWeekId],
      });
    },
  };
};
