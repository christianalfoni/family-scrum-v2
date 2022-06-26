import { PickState } from "react-states";
import { Data, states, State, viewStates } from "./state";

export const isSameView = (viewA: any, viewB: any) => {
  const viewAKeys = Object.keys(viewA);
  const viewBKeys = Object.keys(viewB);

  return (
    viewAKeys.length === viewBKeys.length &&
    viewAKeys.reduce<boolean>((aggr, key) => {
      return aggr ? viewB[key] === viewA[key] : false;
    }, true)
  );
};

export const isDataLoaded = (data: Partial<Data>): data is Data =>
  Boolean(
    data.checkListItemsByTodoId &&
      data.currentWeek &&
      data.dinners &&
      data.family &&
      data.groceries &&
      data.nextWeek &&
      data.previousWeek &&
      data.todos
  );

export const evaluateLoadedState = (
  { data: oldData, user }: PickState<State, "LOADING">,
  newData: Partial<Data>
) => {
  const data = {
    ...oldData,
    ...newData,
  };

  return isDataLoaded(data)
    ? states.LOADED({ user, data, viewStack: [viewStates.DASHBOARD()] })
    : states.LOADING({ user, data });
};

export const updatedLoadedData = (
  state: PickState<State, "LOADED">,
  newData: Partial<Data>
) =>
  states.LOADED({
    ...state,
    data: {
      ...state.data,
      ...newData,
    },
  });
