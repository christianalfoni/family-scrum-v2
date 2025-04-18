import { CalendarIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Controller } from "swiper/modules";
import {
  getWeekDayIndex,
  getFirstDateOfCurrentWeek,
  weekdays,
  upperCaseFirstLetter,
  isWithinWeek,
} from "../../utils";
import { addDays } from "date-fns";
import { WeekdaySlideContent } from "./WeekDaySlideContent";
import { DinnerImage } from "../common/DinnerImage";
import { useFamilyScrum } from "../FamilyScrumContext";
import {
  DinnerDTO,
  TodoDTO,
  TodoDTOWithDate,
  WeekTodoDTO,
} from "../../environment/Persistence";

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

export function CurrentWeekCalendar() {
  const currentDayIndex = getWeekDayIndex();
  const currentWeekDate = getFirstDateOfCurrentWeek();
  const [slideIndex, setSlideIndex] = useState(currentDayIndex);
  const [controlledSwiper, setControlledSwiper] = useState<any>(null);
  const weekDays = Array(7).fill(null);

  return (
    <>
      <Swiper
        className="w-full h-full"
        modules={[Controller]}
        spaceBetween={50}
        slidesPerView={1}
        onSlideChange={(swiper) => setSlideIndex(swiper.activeIndex)}
        onSwiper={setControlledSwiper}
        initialSlide={slideIndex}
      >
        {weekDays.map((_, index) => (
          <SwiperSlide key={index}>
            <WeekdaySlideContent
              title={upperCaseFirstLetter(weekdays[index])}
              date={addDays(currentWeekDate, index).toLocaleDateString()}
            >
              <WeekDay
                key={index}
                weekDayIndex={index}
                currentWeekDate={currentWeekDate}
              />
            </WeekdaySlideContent>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        {weekdays.map((weekday, index) => (
          <div
            key={weekday}
            onClick={() => {
              if (controlledSwiper) {
                controlledSwiper.slideTo(index);
              }
            }}
            className={`${
              index === currentDayIndex ? "text-red-500" : "text-gray-500"
            } ${
              index === slideIndex ? "font-bold" : ""
            } flex items-center mx-2 w-6 h-6 text-center text-xs`}
          >
            {weekdays[index].substring(0, 2)}
          </div>
        ))}
      </div>
    </>
  );
}
