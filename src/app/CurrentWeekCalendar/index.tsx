import { Text } from "@/components/text";
import { CalendarIcon, CalendarDaysIcon } from "@heroicons/react/24/solid";
import { getWeekDayIndex, isWithinWeek } from "../../utils";
import { DinnerImage } from "../common/DinnerImage";
import { DocumentIcon } from "@heroicons/react/24/solid";

import { useFamilyScrum } from "../FamilyScrumContext";
import {
  DinnerDTO,
  TodoDTO,
  TodoDTOWithDate,
  WeekTodoDTO,
} from "../../environment/Persistence";
import { family } from "@/environment/Persistence/converters";
import { Avatar } from "@/components/avatar";
import { Heading } from "@/components/heading";
import { Divider } from "@/components/divider";

function WeekdayDinner({ dinner }: { dinner: DinnerDTO }) {
  return (
    <li key="DINNER">
      <div className="flex items-center space-x-3 h-20">
        <DinnerImage dinner={dinner} />
        <div className="min-w-0 flex-1">
          <p className="text-md font-medium text-gray-900">{dinner.name}</p>
          <p className="text-sm text-gray-500">{dinner.description}</p>
        </div>
      </div>
    </li>
  );
}

function WeekDayEvent({ todo }: { todo: TodoDTOWithDate }) {
  return (
    <li className="py-2 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="flex flex-shrink-0 -space-x-1">
          <CalendarIcon className="w-4 h-4 text-red-500" />
        </div>
        {todo.time ? (
          <span className="text-sm text-gray-500">{todo.time}</span>
        ) : null}

        <p className="ml-4 text-sm font-medium text-gray-900">
          {todo.description}
        </p>
      </div>
    </li>
  );
}

function WeekDayAssignment({
  weekTodo,
  weekDayIndex,
}: {
  weekTodo: WeekTodoDTO;
  weekDayIndex: number;
}) {
  const familyScrum = useFamilyScrum();
  const todo = familyScrum.todos.queryTodo(weekTodo.id);

  return (
    <li className="py-2 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="flex flex-shrink-0 -space-x-1">
          {Object.entries(weekTodo.activityByUserId).map(
            ([userId, assignments]) => {
              const user = familyScrum.family.users[userId];

              if (!assignments[weekDayIndex]) {
                return null;
              }

              return (
                <img
                  key={userId}
                  className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
                  src={user.avatar!}
                  alt={user.name}
                />
              );
            }
          )}
        </div>
        <p className="ml-4 text-sm font-medium text-gray-900">
          {todo.value?.description}
        </p>
      </div>
    </li>
  );
}

function WeekDay({
  weekDayIndex,
  currentWeekDate,
}: {
  weekDayIndex: number;
  currentWeekDate: Date;
}) {
  const familyScrum = useFamilyScrum();
  const todos = familyScrum.todos.todosQuery.value || [];
  const weekTodosThisWeek = (
    familyScrum.weeks.current.weekTodosQuery.value || []
  ).filter(filterWeekTodosThisWeekDay);
  const events = todos.filter(filterTodosWithDateThisWeekDay);
  const currentWeek = familyScrum.weeks.current.weekQuery;
  const dinnerId = currentWeek.value?.dinners[weekDayIndex];
  const dinner = dinnerId
    ? familyScrum.dinners.queryDinner(dinnerId).value
    : null;

  return (
    <ul className="mt-2 ">
      {dinner ? <WeekdayDinner dinner={dinner} /> : null}
      {events.map((todo) => {
        return <WeekDayEvent key={todo.id} todo={todo} />;
      })}
      {weekTodosThisWeek.map((weekTodo) => {
        return (
          <WeekDayAssignment
            key={weekTodo.id}
            weekTodo={weekTodo}
            weekDayIndex={weekDayIndex}
          />
        );
      })}
    </ul>
  );

  function filterWeekTodosThisWeekDay(weekTodo: WeekTodoDTO) {
    for (const userId in weekTodo.activityByUserId) {
      if (weekTodo.activityByUserId[userId][weekDayIndex]) {
        return true;
      }
    }
    return false;
  }

  function filterTodosWithDateThisWeekDay(
    todo: TodoDTO
  ): todo is TodoDTOWithDate {
    return Boolean(
      todo.date &&
        isWithinWeek(todo.date, currentWeekDate) &&
        getWeekDayIndex(todo.date) === weekDayIndex
    );
  }
}

const testData: Array<TodoDTO & { userIds: string[] }> = [
  {
    id: "1",
    created: new Date(),
    modified: new Date(),
    description: "Test",
    date: undefined,
    userIds: ["JY7gXF2TMlfqsMEs3ws9FCYVVe62"],
  },
  {
    id: "2",
    created: new Date(),
    modified: new Date(),
    description: "Test 2",
    date: new Date(),
    userIds: ["JY7gXF2TMlfqsMEs3ws9FCYVVe62"],
  },
];

export function CurrentWeekCalendar() {
  const familyScrum = useFamilyScrum();

  return (
    <>
      <Heading>{new Date().toDateString()}</Heading>
      <Text>Nothing today, relax and breath!</Text>
      <Divider className="my-4" soft />
      <ul>
        <li>
          <Text>Wednesday</Text>
        </li>
        {testData.map((todo) => (
          <li key={todo.id}>
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
              <Avatar
                className="size-6"
                src={familyScrum.family.users[todo.userIds[0]].avatar}
              />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
