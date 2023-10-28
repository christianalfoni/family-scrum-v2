import { useReducer } from "react";
import { match, transition, useDevtools, useTransition } from "react-states";

import { useCreateCheckListItemId } from "../../../hooks/useCheckListItems";
import { User } from "../../../hooks/useCurrentUser";
import { useCreateTodoId, useStoreTodo } from "../../../hooks/useTodos";
import * as selectors from "../../../selectors";
import { CheckListItemsByTodoId, TodoDTO } from "../../../types";

import { Action, actions } from "./actions";
import {
  checklistStates,
  dateStates,
  states,
  State,
  timeStates,
  groceryStates,
} from "./state";

export const reducer = (prevState: State, action: Action) =>
  transition(prevState, action, {
    EDITING: {
      DESCRIPTION_CHANGED: (state, { description }) =>
        states.EDITING({
          ...state,
          description,
        }),
      DATE_TOGGLED: (state) =>
        states.EDITING({
          ...state,
          date: match(state.date, {
            ACTIVE: () => dateStates.INACTIVE(),
            INACTIVE: () => dateStates.ACTIVE(Date.now()),
          }),
        }),
      DATE_CHANGED: (state, { date }) =>
        states.EDITING({
          ...state,
          date: match(state.date, {
            ACTIVE: () => dateStates.ACTIVE(date),
            INACTIVE: (inactiveState) => inactiveState,
          }),
        }),
      TIME_TOGGLED: (state) =>
        states.EDITING({
          ...state,
          time: match(state.time, {
            ACTIVE: () => timeStates.INACTIVE(),
            INACTIVE: () => timeStates.ACTIVE("10:00"),
          }),
        }),
      TIME_CHANGED: (state, { time }) =>
        states.EDITING({
          ...state,
          time: match(state.time, {
            ACTIVE: () => timeStates.ACTIVE(time),
            INACTIVE: (inactiveState) => inactiveState,
          }),
        }),
      CHECKLIST_TOGGLED: (state) =>
        states.EDITING({
          ...state,
          checkList: match(state.checkList, {
            ACTIVE: () => checklistStates.INACTIVE(),
            INACTIVE: () => checklistStates.ACTIVE([]),
          }),
        }),
      CHECKLIST_ITEM_ADDED: (state, { title }) =>
        states.EDITING({
          ...state,
          checkList: match(state.checkList, {
            ACTIVE: ({ items }) =>
              checklistStates.ACTIVE([...items, { title }]),
            INACTIVE: (inactiveState) => inactiveState,
          }),
        }),
      CHECKLIST_ITEM_REMOVED: (state, { index }) =>
        states.EDITING({
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
      GROCERY_TOGGLED: (state) =>
        states.EDITING({
          ...state,
          grocery: match(state.grocery, {
            ACTIVE: () => groceryStates.INACTIVE(),
            INACTIVE: () => groceryStates.ACTIVE(""),
          }),
        }),
      GROCERY_NAME_CHANGED: (state, { name }) =>
        states.EDITING({
          ...state,
          grocery: match(state.grocery, {
            ACTIVE: () => groceryStates.ACTIVE(name),
            INACTIVE: (inactiveState) => inactiveState,
          }),
        }),
      ADD_TODO: ({ description, date, time, checkList, grocery }) =>
        states.EDITING({
          checkList,
          date,
          description,
          time,
          grocery,
        }),
    },
  });

export const useEditTodo = ({
  todo,
  checkListItemsByTodoId,
  initialState,
  onExit,
  user,
}: {
  user: User;
  todo?: TodoDTO;
  checkListItemsByTodoId: CheckListItemsByTodoId;
  initialState?: State;
  onExit: () => void;
}) => {
  const storeTodo = useStoreTodo(user);
  const createTodoId = useCreateTodoId(user);
  const createCheckListItemId = useCreateCheckListItemId(user);
  const todoReducer = useReducer(
    reducer,
    initialState ||
      (todo
        ? states.EDITING({
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
            grocery: todo.grocery
              ? groceryStates.ACTIVE(todo.grocery)
              : groceryStates.INACTIVE(),
          })
        : states.EDITING({
            description: "",
            checkList: checklistStates.INACTIVE(),
            date: dateStates.INACTIVE(),
            time: timeStates.INACTIVE(),
            grocery: groceryStates.INACTIVE(),
          }))
  );

  useDevtools("EditTodo", todoReducer);

  const [state, dispatch] = todoReducer;

  useTransition(
    state,
    "EDITING => ADD_TODO => EDITING",
    ({ description, checkList, date, time, grocery }) => {
      storeTodo(
        {
          id: todo ? todo.id : createTodoId(),
          description,
          date: match(date, {
            ACTIVE: ({ date }) => date,
            INACTIVE: () => undefined,
          }),
          time: match(time, {
            ACTIVE: ({ time }) => time,
            INACTIVE: () => undefined,
          }),
          grocery: match(grocery, {
            ACTIVE: ({ name }) => name,
            INACTIVE: () => undefined,
          }),
        },
        match(checkList, {
          ACTIVE: ({ items }) =>
            items.map(({ title, id }) => ({
              id: id || createCheckListItemId(),
              title,
            })),
          INACTIVE: () => undefined,
        })
      );
      onExit();
    }
  );

  return [state, actions(dispatch)] as const;
};
