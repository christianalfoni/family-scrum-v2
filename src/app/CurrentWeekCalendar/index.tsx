import { Text } from "@/components/text";
import { CalendarDaysIcon } from "@heroicons/react/24/solid";
import {
  getFirstDateOfCurrentWeek,
  getWeekDayIndex,
  isWithinWeek,
  weekdays,
} from "../../utils";
import { DocumentIcon } from "@heroicons/react/24/solid";
import { useFamilyScrum } from "../FamilyScrumContext";
import {
  TodoDTO,
  TodoDTOWithDate,
  WeekTodoDTO,
} from "../../environment/Persistence";
import { Avatar } from "@/components/avatar";
import { Heading } from "@/components/heading";
import { Divider } from "@/components/divider";

function WeekDay({
  todoId,
  weekDayIndex,
}: {
  todoId: string;
  weekDayIndex: number;
}) {
  const familyScrum = useFamilyScrum();
  const todo = familyScrum.todos.queryTodo(todoId).value;
  const weekTodo = familyScrum.weeks.current.queryWeekTodo(todoId).value;

  // TODO: Show like placeholder thingy
  if (!todo) {
    return null;
  }

  const activityByUserId = weekTodo?.activityByUserId || {};
  const userIds = Object.keys(activityByUserId).filter((userId) =>
    Boolean(activityByUserId[userId][weekDayIndex])
  );

  return (
    <li>
      <div className="flex items-center space-x-3 h-10">
        {todo.date ? (
          <CalendarDaysIcon className="w-4 h-4 text-red-400" />
        ) : (
          <DocumentIcon className="w-4 h-4 text-orange-400" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-md font-medium text-zinc-200">
            {todo.description}
          </p>
        </div>
        {userIds.map((userId) => (
          <Avatar
            className="size-6"
            src={familyScrum.family.users[userId].avatar}
          />
        ))}
      </div>
    </li>
  );
}

export function CurrentWeekCalendar() {
  const familyScrum = useFamilyScrum();
  const todos = familyScrum.todos.todosQuery.value || [];
  const currentWeekDate = getFirstDateOfCurrentWeek();
  const weekTodosThisWeek =
    familyScrum.weeks.current.weekTodosQuery.value || [];
  const events = todos.filter(filterTodosWithDateThisWeek);
  const currentWeekDayIndex = getWeekDayIndex();
  const weekDaysTodoIds = getWeekTodoIds();
  const todaysTodos = weekDaysTodoIds[currentWeekDayIndex];

  return (
    <>
      <Heading>{new Date().toDateString()}</Heading>
      {todaysTodos.length ? (
        <ul>
          {todaysTodos.map((todoId) => (
            <WeekDay
              key={todoId}
              weekDayIndex={currentWeekDayIndex}
              todoId={todoId}
            />
          ))}
        </ul>
      ) : (
        <Text>Nothing today, relax and breath!</Text>
      )}
      <Divider className="my-4" soft />
      <ul>
        {weekDaysTodoIds.map((todos, index) => {
          if (index <= currentWeekDayIndex || !todos.length) {
            return null;
          }

          return (
            <>
              <li>
                <Text>{weekdays[index]}</Text>
              </li>
              {todos.map((todoId) => (
                <WeekDay key={todoId} weekDayIndex={index} todoId={todoId} />
              ))}
            </>
          );
        })}
      </ul>
    </>
  );

  function getWeekTodoIds() {
    return Array.from({ length: 7 }).map((_, weekDayIndex) =>
      events
        .filter((todo) => getWeekDayIndex(todo.date!) === weekDayIndex)
        .map((todo) => todo.id)
        .concat(
          weekTodosThisWeek
            .filter((weekTodo) =>
              filterWeekTodosThisWeekDay(weekTodo, weekDayIndex)
            )
            .map((todo) => todo.id)
        )
    );
  }

  function filterWeekTodosThisWeekDay(
    weekTodo: WeekTodoDTO,
    weekDayIndex: number
  ) {
    for (const userId in weekTodo.activityByUserId) {
      if (weekTodo.activityByUserId[userId][weekDayIndex]) {
        return true;
      }
    }
    return false;
  }

  function filterTodosWithDateThisWeek(todo: TodoDTO): todo is TodoDTOWithDate {
    return Boolean(todo.date && isWithinWeek(todo.date, currentWeekDate));
  }
}
