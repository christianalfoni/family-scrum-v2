import { reactive } from "bonsify";
import { Environment } from "../environments";
import {
  GroceryDTO,
  TodoDTO,
  WeekDTO,
} from "../environments/Browser/Persistence";
import { DinnerDTO } from "../environments/Browser/Persistence";
import { AUTHENTICATED } from "./Session";
import { Todo } from "./Todo";
import { Dinner } from "./Dinner";
import { Week } from "./Week";
import { Grocery } from "./Grocery";
import { getNextWeekId } from "../utils";

export type Data = ReturnType<typeof Data>;

type Params = {
  session: AUTHENTICATED;
  env: Environment;
  onDispose: (dispose: () => void) => void;
};

export function Data({ session, env, onDispose }: Params) {
  const familyPersistence = env.persistence.createFamilyApi(session.family.id);
  const familyStorage = env.storage.createFamilyStorage(session.family.id);
  const nextWeekTodosApi = familyPersistence.createWeekTodosApi(
    getNextWeekId()
  );
  const todos = reactive.view(createTodo);
  const dinners = reactive.view(createDinner);
  const weeks = reactive.view(createWeek);
  const groceries = reactive.view(createGrocery);

  onDispose(familyPersistence.todos.subscribeAll(updateTodos));
  onDispose(familyPersistence.dinners.subscribeAll(updateDinners));
  onDispose(familyPersistence.weeks.subscribeAll(updateWeeks));
  onDispose(familyPersistence.groceries.subscribeAll(updateGroceries));

  return {
    todos,
    dinners,
    weeks,
    groceries,
  };

  function createTodo(data: TodoDTO) {
    return Todo({
      data,
      familyPersistence,
      familyScrum: session.familyScrum,
      nextWeekTodosApi,
    });
  }

  function createDinner(data: DinnerDTO) {
    return Dinner({
      data,
      familyStorage,
    });
  }

  function createWeek(data: WeekDTO) {
    return Week({
      data,
      familyStorage,
    });
  }

  function createGrocery(data: GroceryDTO) {
    return Grocery({
      data,
      familyPersistence,
    });
  }

  function updateTodos(todosData: TodoDTO[]) {
    todosData.forEach((todo) => {
      todos.data[todo.id] = Todo({
        data: todo,
        familyPersistence,
        familyScrum: session.familyScrum,
        nextWeekTodosApi,
      });
    });
  }

  function updateDinners(dinnersData: DinnerDTO[]) {
    dinnersData.forEach((dinner) => {
      dinners.data[dinner.id] = dinner;
    });
  }

  function updateWeeks(weeksData: WeekDTO[]) {
    weeksData.forEach((week) => {
      weeks.data[week.id] = week;
    });
  }

  function updateGroceries(groceriesData: GroceryDTO[]) {
    groceriesData.forEach((grocery) => {
      groceries.data[grocery.id] = grocery;
    });
  }
}
