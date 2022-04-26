import { useReducer } from "react";
import {
  $COMMAND,
  IAction,
  ICommand,
  IState,
  match,
  pick,
  PickCommand,
  ReturnTypes,
  transition,
  TTransitions,
  useCommandEffect,
  useDevtools,
} from "react-states";
import { useEnvironment } from "../../environment-interface";
import {
  CheckListItemsByTodoId,
  TodoDTO,
} from "../../environment-interface/storage";
import * as selectors from "../../selectors";

const actions = {
  DESCRIPTION_CHANGED: (description: string) => ({
    type: "DESCRIPTION_CHANGED" as const,
    description,
  }),
  DATE_TOGGLED: () => ({
    type: "DATE_TOGGLED" as const,
  }),
  DATE_CHANGED: (date: number) => ({
    type: "DATE_CHANGED" as const,
    date,
  }),
  TIME_TOGGLED: () => ({
    type: "TIME_TOGGLED" as const,
  }),
  TIME_CHANGED: (time: string) => ({
    type: "TIME_CHANGED" as const,
    time,
  }),
  CHECKLIST_TOGGLED: () => ({
    type: "CHECKLIST_TOGGLED" as const,
  }),
  CHECKLIST_ITEM_ADDED: (title: string) => ({
    type: "CHECKLIST_ITEM_ADDED" as const,
    title,
  }),
  CHECKLIST_ITEM_REMOVED: (index: number) => ({
    type: "CHECKLIST_ITEM_REMOVED" as const,
    index,
  }),
  ADD_TODO: () => ({
    type: "ADD_TODO" as const,
  }),
};
type Action = ReturnTypes<typeof actions, IAction>;

const commands = {
  ADD_TODO: (params: {
    description: string;
    date?: number;
    time?: string;
    checkList?: Array<{ title: string; id?: string }>;
  }) => ({
    cmd: "ADD_TODO" as const,
    ...params,
  }),
};

type Command = ReturnTypes<typeof commands, ICommand>;

const dateStates = {
  INACTIVE: () => ({
    state: "INACTIVE" as const,
  }),
  ACTIVE: (date: number) => ({
    state: "ACTIVE" as const,
    date,
    ...pick(actions, "DATE_CHANGED"),
  }),
};

type DateState = ReturnTypes<typeof dateStates, IState>;

const timeStates = {
  INACTIVE: () => ({
    state: "INACTIVE" as const,
  }),
  ACTIVE: (time: string) => ({
    state: "ACTIVE" as const,
    time,
    ...pick(actions, "TIME_CHANGED"),
  }),
};

type TimeState = ReturnTypes<typeof timeStates, IState>;

const checklistStates = {
  INACTIVE: () => ({
    state: "INACTIVE" as const,
  }),
  ACTIVE: (items: Array<{ title: string; id?: string }>) => ({
    state: "ACTIVE" as const,
    items,
    ...pick(actions, "CHECKLIST_ITEM_ADDED", "CHECKLIST_ITEM_REMOVED"),
  }),
};

type ChecklistState = ReturnTypes<typeof checklistStates, IState>;

const validationStates = {
  VALID: () => ({
    state: "VALID" as const,
    ...pick(actions, "ADD_TODO"),
  }),
  INVALID: () => ({
    state: "INVALID" as const,
  }),
};

type ValidationState = ReturnTypes<typeof validationStates, IState>;

type BaseState = {
  description: string;
  date: DateState;
  time: TimeState;
  checkList: ChecklistState;
};

const states = {
  EDITING: (
    { checkList, date, description, time }: BaseState,
    command?: PickCommand<Command, "ADD_TODO">
  ) => {
    const validation = description
      ? validationStates.VALID()
      : validationStates.INVALID();

    return {
      state: "EDITING" as const,
      description,
      time,
      date,
      checkList,
      validation,
      [$COMMAND]: command && validation.state === "VALID" ? command : undefined,
      ...pick(
        actions,
        "DESCRIPTION_CHANGED",
        "TIME_TOGGLED",
        "DATE_TOGGLED",
        "CHECKLIST_TOGGLED"
      ),
    };
  },
};

type State = ReturnTypes<typeof states, IState>;

export const { EDITING } = states;

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
