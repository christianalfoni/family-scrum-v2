import { useReducer } from "react";
import {
  match,
  transition,
  TTransitions,
  useCommandEffect,
  useDevtools,
} from "react-states";
import { useEnvironment } from "../../../environment-interface";
import {
  CheckListItemsByTodoId,
  TodoDTO,
} from "../../../environment-interface/storage";
import * as selectors from "../../../selectors";

import { Action } from "./actions";
import {
  checklistStates,
  commands,
  dateStates,
  EDITING,
  State,
  timeStates,
} from "./state";

const transitions: TTransitions<State, Action> = {
  EDITING: {
    DESCRIPTION_CHANGED: (state, { description }) =>
      EDITING({
        ...state,
        description,
      }),
    DATE_TOGGLED: (state) =>
      EDITING({
        ...state,
        date: match(state.date, {
          ACTIVE: () => dateStates.INACTIVE(),
          INACTIVE: () => dateStates.ACTIVE(Date.now()),
        }),
      }),
    DATE_CHANGED: (state, { date }) =>
      EDITING({
        ...state,
        date: match(state.date, {
          ACTIVE: () => dateStates.ACTIVE(date),
          INACTIVE: (inactiveState) => inactiveState,
        }),
      }),
    TIME_TOGGLED: (state) =>
      EDITING({
        ...state,
        time: match(state.time, {
          ACTIVE: () => timeStates.INACTIVE(),
          INACTIVE: () => timeStates.ACTIVE("10:00"),
        }),
      }),
    TIME_CHANGED: (state, { time }) =>
      EDITING({
        ...state,
        time: match(state.time, {
          ACTIVE: () => timeStates.ACTIVE(time),
          INACTIVE: (inactiveState) => inactiveState,
        }),
      }),
    CHECKLIST_TOGGLED: (state) =>
      EDITING({
        ...state,
        checkList: match(state.checkList, {
          ACTIVE: () => checklistStates.INACTIVE(),
          INACTIVE: () => checklistStates.ACTIVE([]),
        }),
      }),
    CHECKLIST_ITEM_ADDED: (state, { title }) =>
      EDITING({
        ...state,
        checkList: match(state.checkList, {
          ACTIVE: ({ items }) => checklistStates.ACTIVE([...items, { title }]),
          INACTIVE: (inactiveState) => inactiveState,
        }),
      }),
    CHECKLIST_ITEM_REMOVED: (state, { index }) =>
      EDITING({
        ...state,
        checkList: match(state.checkList, {
          ACTIVE: ({ items }) =>
            checklistStates.ACTIVE([
              ...items.slice(0, index),
              ...items.slice(index + 1),
            ]),
          INACTIVE: (inactiveState) => inactiveState,
        }),
      }),
    ADD_TODO: ({ description, date, time, checkList }) =>
      EDITING(
        {
          checkList,
          date,
          description,
          time,
        },
        commands.ADD_TODO({
          description,
          checkList: match(checkList, {
            ACTIVE: ({ items }) => items,
            INACTIVE: () => undefined,
          }),
          date: match(date, {
            ACTIVE: ({ date }) => date,
            INACTIVE: () => undefined,
          }),
          time: match(time, {
            ACTIVE: ({ time }) => time,
            INACTIVE: () => undefined,
          }),
        })
      ),
  },
};

export const reducer = (state: State, action: Action) =>
  transition(state, action, transitions);

export const useEditTodo = ({
  todo,
  checkListItemsByTodoId,
  initialState,
  onExit,
}: {
  todo?: TodoDTO;
  checkListItemsByTodoId: CheckListItemsByTodoId;
  initialState?: State;
  onExit: () => void;
}) => {
  const { storage } = useEnvironment();
  const todoReducer = useReducer(
    reducer,
    initialState ||
      (todo
        ? EDITING({
            description: todo.description,
            checkList: todo.checkList
              ? checklistStates.ACTIVE(
                  selectors
                    .sortedCheckListItems(checkListItemsByTodoId[todo.id] || {})
                    .map((item) => ({ title: item.title, id: item.id }))
                )
              : checklistStates.INACTIVE(),
            date: todo.date
              ? dateStates.ACTIVE(todo.date)
              : dateStates.INACTIVE(),
            time: todo.time
              ? timeStates.ACTIVE(todo.time)
              : timeStates.INACTIVE(),
          })
        : EDITING({
            description: "",
            checkList: checklistStates.INACTIVE(),
            date: dateStates.INACTIVE(),
            time: timeStates.INACTIVE(),
          }))
  );

  useDevtools("EditTodo", todoReducer);

  const [state] = todoReducer;

  useCommandEffect(
    state,
    "ADD_TODO",
    ({ description, checkList, date, time }) => {
      storage.storeTodo(
        {
          id: todo ? todo.id : storage.createTodoId(),
          description,
          date,
          time,
        },
        checkList
          ? checkList.map(({ title, id }) => ({
              id: id || storage.createCheckListItemId(),
              title,
            }))
          : undefined
      );
      onExit();
    }
  );

  return todoReducer;
};
