import { createContext, useContext } from "react";
import {
  DinnerDTO,
  FamilyDTO,
  FamilyUserDTO,
  TodoDTO,
  UserDTO,
  WeekTodoDTO,
} from "../../environments/Browser/Persistence";
import { Groceries, useGroceries } from "./useGroceries";
import { Todos, useTodos } from "./useTodos";
import { Dinners, useDinners } from "./useDinners";
import { Weeks, useWeeks } from "./useWeeks";
import { Awake, useAwake } from "./useAwake";
import { getWeekDayIndex, isWithinWeek } from "../../utils";
import { useReactiveMemo } from "use-reactive-react";

export type FamilyScrum = {
  user: UserDTO;
  family: FamilyDTO;
  groceries: Groceries;
  todos: Todos;
  dinners: Dinners;
  weeks: Weeks;
  awake: Awake;
  weekDinners: (DinnerDTO | null)[];
  weekTodos: { todo: TodoDTO; assignments: FamilyUserDTO[] }[][];
};

const FamilyScrumContext = createContext(null as unknown as FamilyScrum);

export function useFamilyScrum() {
  return useContext(FamilyScrumContext);
}

type Props = {
  user: UserDTO;
  family: FamilyDTO;
  children: React.ReactNode;
};

export function FamilyScrumProvider({ user, family, children }: Props) {
  const groceries = useGroceries(family.id);
  const todos = useTodos({ familyId: family.id, userId: user.id });
  const dinners = useDinners(family.id);
  const weeks = useWeeks(family.id);
  const awake = useAwake();
  const weekDinnersMemo = useReactiveMemo(deriveWeekDinners);
  const weekTodosMemo = useReactiveMemo(deriveWeekTodos);

  return (
    <FamilyScrumContext.Provider
      value={{
        user,
        family,
        groceries,
        dinners,
        todos,
        weeks,
        awake,
        get weekDinners() {
          return weekDinnersMemo.current;
        },
        get weekTodos() {
          return weekTodosMemo.current;
        },
      }}
    >
      {children}
    </FamilyScrumContext.Provider>
  );

  function deriveWeekDinners() {
    return weeks.current.dinners.map(
      (dinnerId) =>
        dinners.dinners.find((dinner) => dinner.id === dinnerId) || null
    );
  }

  function deriveWeekTodos() {
    const weekDays: Array<{ todo: TodoDTO; assignments: FamilyUserDTO[] }>[] =
      Array(7).fill([]);
    const now = new Date();

    todos.todos.forEach((todo) => {
      const weekTodo = weeks.current.todos.find(
        (weekTodo) => weekTodo.id === todo.id
      );

      if (weekTodo) {
        const weekTodoAssignments = getWeekTodoAssignments(weekTodo);

        weekTodoAssignments.forEach((assignments, index) => {
          if (assignments.length) {
            weekDays[index].push({ todo, assignments });
          }
        });

        return;
      }

      if (todo.date && isWithinWeek(todo.date.toDate(), now)) {
        const weekDayIndex = getWeekDayIndex(todo.date.toDate());

        weekDays[weekDayIndex].push({
          todo,
          assignments: [],
        });
      }
    });

    return weekDays;
  }

  function getWeekTodoAssignments(weekTodo: WeekTodoDTO) {
    const assignments: FamilyUserDTO[][] = Array(7).fill([]);

    for (const userId in weekTodo.activityByUserId) {
      const familyMember = family.users[userId];
      const userAssignments = weekTodo.activityByUserId[userId];

      for (
        let weekDayIndex = 0;
        weekDayIndex++;
        weekDayIndex < userAssignments.length
      ) {
        if (userAssignments[weekDayIndex]) {
          assignments[weekDayIndex].push(familyMember);
        }
      }
    }

    return assignments;
  }
}
