import { reactive } from "bonsify";
import { Environment } from "../environments";
import { SessionAuthenticated } from "./Session";
import { Groceries } from "./Groceries";
import { Dinners } from "./Dinners";
import { Todos } from "./Todos";
import { Weeks } from "./Weeks";
import { Awake } from "../environments/Browser/Awake";
import { Todo } from "./Todo";
import { Dinner } from "./Dinner";
import { FamilyUserDTO } from "../environments/Browser/Persistence";
import { getDay, isThisWeek } from "date-fns";
import { getWeekDayIndex, mod } from "../utils";

type EventEntry = {
  type: "event";
  todo: Todo;
};

type TodoEntry = {
  type: "todo";
  assignedTo: FamilyUserDTO[];
  todo: Todo;
};

type WeekDayEntry = {
  entries: Array<EventEntry | TodoEntry>;
  dinner?: Dinner;
};

type WeekEntries = [
  WeekDayEntry,
  WeekDayEntry,
  WeekDayEntry,
  WeekDayEntry,
  WeekDayEntry,
  WeekDayEntry,
  WeekDayEntry
];

export type FamilyScrum = {
  session: SessionAuthenticated;
  groceries: Groceries;
  todos: Todos;
  dinners: Dinners;
  weeks: Weeks;
  awake: Awake;
  weekEntries: WeekEntries;
};

type Params = {
  env: Environment;
  session: SessionAuthenticated;
  onDispose: (dispose: () => void) => void;
};

export function FamilyScrum({ env, session, onDispose }: Params): FamilyScrum {
  const familyPersistence = env.persistence.createFamilyApi(session.family.id);
  const familyStorage = env.storage.createFamilyStorage(session.family.id);
  const familyScrum = reactive<FamilyScrum>({
    session,
    awake: env.awake,
    get groceries() {
      return groceries;
    },
    get todos() {
      return todos;
    },
    get dinners() {
      return dinners;
    },
    get weeks() {
      return weeks;
    },
    get weekEntries() {
      return getWeekEntries();
    },
  });

  const groceries = Groceries({
    env,
    onDispose,
    familyPersistence,
    familyScrum,
  });

  const todos = Todos({
    env,
    familyScrum,
    familyPersistence,
    onDispose,
  });

  const dinners = Dinners({
    env,
    familyScrum,
    familyPersistence,
    familyStorage,
    onDispose,
  });

  const weeks = Weeks({
    familyScrum,
    familyPersistence,
    onDispose,
  });

  return reactive.readonly(familyScrum);

  function getWeekEntries(): WeekEntries {
    const currentWeekTodos = weeks.current.todos;
    const weekEntries = Array(7).fill({
      entries: [],
    }) as WeekEntries;

    todos.todos.forEach((todo) => {
      if (
        todo.date &&
        isThisWeek(todo.date.toMillis(), {
          weekStartsOn: 1,
        })
      ) {
        const weekDayIndex = getWeekDayIndex(todo.date.toMillis());

        weekEntries[weekDayIndex].entries.push({
          type: "event",
          todo,
        });
      }

      const weekTodo = currentWeekTodos.find(
        (weekTodo) => weekTodo.id === todo.id
      );

      if (!weekTodo) {
        return;
      }

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const assignedTo: FamilyUserDTO[] = [];
        for (const userId in weekTodo.activityByUserId) {
          if (weekTodo.activityByUserId[userId][dayIndex]) {
            assignedTo.push(familyScrum.session.family.users[userId]);
          }
        }

        if (assignedTo.length) {
          weekEntries[dayIndex].entries.push({
            type: "todo",
            assignedTo,
            todo,
          });
        }
      }
    });

    return weekEntries;
  }
}
