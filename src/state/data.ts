import {
  DinnerDTO,
  FamilyPersistence,
  GroceryDTO,
  TodoDTO,
  WeekDTO,
  WeekTodoDTO,
} from "../Environment/Persistence";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";
import { Timestamp } from "firebase/firestore";
import { reactive } from "bonsify";

export type DataState = {
  groceries: GroceryDTO[];
  dinners: DinnerDTO[];
  todos: TodoDTO[];
  previousWeek: WeekData;
  currentWeek: WeekData;
  nextWeek: WeekData;
  unsubscribe(): void;
};

type WeekData = {
  week: WeekDTO;
  weekTodos: Record<string, WeekTodoDTO>;
  unsubscribe(): void;
};

type Params = {
  familyPersistence: FamilyPersistence;
};

export function Data({ familyPersistence }: Params) {
  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();
  const [previousWeek, currentWeek, nextWeek] = [
    previousWeekId,
    currentWeekId,
    nextWeekId,
  ].map(createWeekData);

  const state = reactive<DataState>({
    groceries: [],
    dinners: [],
    todos: [],
    previousWeek,
    currentWeek,
    nextWeek,
    unsubscribe,
  });

  const disposeOnGroceriesCollectionSnapshot =
    familyPersistence.groceries.subscribeAll((groceries) => {
      state.groceries = groceries;
    });
  const disposeOnDinnersCollectionSnapshot =
    familyPersistence.dinners.subscribeAll((dinners) => {
      state.dinners = dinners;
    });
  const disposeOnTodosCollectionSnapshot = familyPersistence.todos.subscribeAll(
    (todos) => {
      state.todos = todos;
    }
  );

  return state;

  function unsubscribe() {
    previousWeek.unsubscribe();
    currentWeek.unsubscribe();
    nextWeek.unsubscribe();
    disposeOnGroceriesCollectionSnapshot();
    disposeOnDinnersCollectionSnapshot();
    disposeOnTodosCollectionSnapshot();
  }

  function createWeekData(weekId: string) {
    const weekData = reactive<WeekData>({
      week: {
        id: weekId,
        dinners: [null, null, null, null, null, null, null],
      },
      weekTodos: {},
      unsubscribe() {
        disposeOnWeeksCollectionSnapshot();
        disposeOnWeekTodosCollectionSnapshot();
      },
    });

    const disposeOnWeeksCollectionSnapshot = familyPersistence.weeks.subscribe(
      weekId,
      (update) => {
        weekData.week = update;
      }
    );
    const weekTodosApi = familyPersistence.createWeekTodosApi(weekId);
    const disposeOnWeekTodosCollectionSnapshot = weekTodosApi.subscribeAll(
      (update) => {
        weekData.weekTodos = collectionToLookupRecord(update);
      }
    );

    return weekData;
  }

  function collectionToLookupRecord<T extends { id: string }>(collection: T[]) {
    return collection.reduce<Record<string, T>>((aggr, doc) => {
      aggr[doc.id] = doc;

      return aggr;
    }, {});
  }
}
