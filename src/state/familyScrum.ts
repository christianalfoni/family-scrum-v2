import { reactive } from "bonsify";
import { createDashboard, Dashboard } from "./dashboard";
import {
  DinnerDTO,
  FamilyDTO,
  FirebaseApi,
  GroceryDTO,
  TodoDTO,
  UserDTO,
  WeekDTO,
  WeekTodoDTO,
} from "../apis/firebase";
import { Apis } from "../apis";
import { getCurrentWeekId, getNextWeekId, getPreviousWeekId } from "../utils";
import { Timestamp } from "firebase/firestore";

type Data = {
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

export type Views = {
  name: "dashboard";
  state: Dashboard;
};

export type FamilyScrum = {
  user: UserDTO;
  family: FamilyDTO;
  view: Views;
  back(): void;
  dispose(): void;
};

export const createFamilyScrum = (
  apis: Apis,
  user: UserDTO,
  family: FamilyDTO
) => {
  const { firebase } = apis;
  const viewStates = {
    dashboard: createDashboard(apis),
  };

  const viewStack = reactive<Views[]>([
    {
      name: "dashboard",
      state: viewStates.dashboard,
    },
  ]);

  const data = subscribeToData(firebase, user, family);

  const familyScrum = reactive<FamilyScrum>({
    user,
    family,
    get view() {
      return viewStack[viewStack.length - 1];
    },
    back() {
      viewStack.pop();
    },
    dispose() {},
  });

  return familyScrum;
};

// We map over the previous, current and next week to get and subscribe to
// the week dinners and todos of the week
function subscribeToData(
  firebase: FirebaseApi,
  user: UserDTO,
  family: FamilyDTO
) {
  const groceriesCollection = firebase.collections.groceries(family.id);
  const todosCollection = firebase.collections.todos(family.id);
  const dinnersCollection = firebase.collections.dinners(family.id);

  const disposeOnGroceriesCollectionSnapshot = firebase.onCollectionSnapshot(
    groceriesCollection,
    (groceries) => {
      data.groceries = groceries;
    }
  );
  const disposeOnDinnersCollectionSnapshot = firebase.onCollectionSnapshot(
    dinnersCollection,
    (dinners) => {
      data.dinners = dinners;
    }
  );
  const disposeOnTodosCollectionSnapshot = firebase.onCollectionSnapshot(
    todosCollection,
    (todos) => {
      data.todos = todos;
    }
  );

  const weeksCollection = firebase.collections.weeks(user.familyId);
  const previousWeekId = getPreviousWeekId();
  const currentWeekId = getCurrentWeekId();
  const nextWeekId = getNextWeekId();

  const [previousWeek, currentWeek, nextWeek] = [
    previousWeekId,
    currentWeekId,
    nextWeekId,
  ].map((weekId) => {
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

    const weekTodosCollection = firebase.collections.weekTodos(
      user.familyId,
      weekId
    );

    const disposeOnWeeksCollectionSnapshot = firebase.onDocSnapshot(
      weeksCollection,
      weekId,
      (update) => {
        weekData.week = update;
      }
    );

    const disposeOnWeekTodosCollectionSnapshot = firebase.onCollectionSnapshot(
      weekTodosCollection,
      (update) => {
        weekData.weekTodos = collectionToLookupRecord(update);
      }
    );

    return weekData;
  });

  const data = reactive<Data>({
    groceries: [],
    dinners: [],
    todos: [],
    previousWeek,
    currentWeek,
    nextWeek,
    unsubscribe() {
      previousWeek.unsubscribe();
      currentWeek.unsubscribe();
      nextWeek.unsubscribe();
      disposeOnGroceriesCollectionSnapshot();
      disposeOnDinnersCollectionSnapshot();
      disposeOnTodosCollectionSnapshot();
    },
  });
}

function collectionToLookupRecord<T extends { id: string }>(collection: T[]) {
  return collection.reduce<Record<string, T>>((aggr, doc) => {
    aggr[doc.id] = doc;

    return aggr;
  }, {});
}

function sortByCreated<T extends { created: Timestamp }>(items: T[]) {
  return items.sort((a, b) => {
    if (a.created < b.created) {
      return 1;
    } else if (a.created > b.created) {
      return -1;
    }

    return 0;
  });
}
