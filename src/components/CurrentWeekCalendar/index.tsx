import { CalendarIcon } from "@heroicons/react/24/solid";
import { useMemo, useState } from "react";
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
import { useFamilyScrum } from "../FamilyScrum/useFamilyScrum";
import {
  DinnerDTO,
  FamilyUserDTO,
  TodoDTO,
  WeekTodoDTO,
} from "../../environments/Browser/Persistence";

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

export function CurrentWeekCalendar() {
  const familyScrum = useFamilyScrum();
  const currentDayIndex = getWeekDayIndex();
  const currentWeekDate = getFirstDateOfCurrentWeek();
  const [slideIndex, setSlideIndex] = useState(currentDayIndex);
  const [controlledSwiper, setControlledSwiper] = useState<any>(null);
  const weekDays = Array(7).fill(null);
  const weeks = familyScrum.weeks;
  const dinners = familyScrum.dinners;
  const todos = familyScrum.todos;
  const weekDinners = useMemo(deriveWeekDinners, [
    weeks.current.value,
    dinners.dinners.value,
  ]);
  const weekTodos = useMemo(deriveWeekTodos, [
    todos.todos.value,
    weeks.current.value,
    familyScrum.family.users,
  ]);

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
        {weekDays.map((_, index) => {
          const weekDinner = weekDinners[index];
          const weekEvents = weekTodos[index].filter(
            ({ todo, assignments }) => todo.date && !assignments.length
          );
          const weekdayTodos = weekTodos[index].filter(({ assignments }) =>
            Boolean(assignments.length)
          );

          return (
            <SwiperSlide key={index}>
              <WeekdaySlideContent
                title={upperCaseFirstLetter(weekdays[index])}
                date={addDays(currentWeekDate, index).toLocaleDateString()}
              >
                {
                  <ul className="mt-2 ">
                    {weekDinner ? (
                      <WeekdayDinner key="WEEKDAY_DINNER" dinner={weekDinner} />
                    ) : null}
                    {weekEvents.map((weekEvent) => {
                      return (
                        <li
                          key={weekEvent.todo.id}
                          className="py-2 flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-shrink-0 -space-x-1">
                              <CalendarIcon className="w-4 h-4 text-red-500" />
                            </div>
                            {weekEvent.todo.time ? (
                              <span className="text-sm text-gray-500">
                                {weekEvent.todo.time}
                              </span>
                            ) : null}

                            <p className="ml-4 text-sm font-medium text-gray-900">
                              {weekEvent.todo.description}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                    {weekdayTodos.map((weekTodo) => {
                      const todo = weekTodo.todo;

                      return (
                        <li
                          key={todo.id}
                          className="py-2 flex justify-between items-center"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-shrink-0 -space-x-1">
                              {weekTodo.assignments.map((assignment) => (
                                <img
                                  key={assignment.name}
                                  className="max-w-none h-6 w-6 rounded-full ring-2 ring-white"
                                  src={assignment.avatar!}
                                  alt={assignment.name}
                                />
                              ))}
                            </div>
                            <p className="ml-4 text-sm font-medium text-gray-900">
                              {todo.description}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                }
              </WeekdaySlideContent>
            </SwiperSlide>
          );
        })}
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

  function deriveWeekDinners() {
    return weeks.current.value.dinners.map(
      (dinnerId) =>
        dinners.dinners.value.find((dinner) => dinner.id === dinnerId) || null
    );
  }

  function deriveWeekTodos() {
    const weekDays: Array<{ todo: TodoDTO; assignments: FamilyUserDTO[] }>[] =
      Array(7).fill([]);
    const now = new Date();

    todos.todos.value.forEach((todo) => {
      const weekTodo = weeks.current.value.todos.find(
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
      const familyMember = familyScrum.family.users[userId];
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
