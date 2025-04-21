import {
  CalendarIcon,
  ChevronLeftIcon,
  ClipboardIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useFamilyScrum } from "./FamilyScrumContext";
import { NewTodo as TNewTodo } from "../state/TodosState";
import {
  Description,
  Field,
  FieldGroup,
  Fieldset,
  Label,
  Legend,
} from "@/components/fieldset";
import { Textarea } from "@/components/textarea";
import { Text } from "@/components/text";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Checkbox, CheckboxField, CheckboxGroup } from "@/components/checkbox";
import { Divider } from "@/components/divider";

function EditTodoPage({
  todo,
  isSaving,
  onSubmit,
}: {
  todo: TNewTodo;
  isSaving: boolean;
  onSubmit: (data: TNewTodo) => void;
}) {
  const navigate = useNavigate();
  const [newCheckListItemTitle, setNewCheckListItemTitle] = useState("");
  const [state, setState] = useState({
    description: todo.description,
    date: todo.date,
    time: todo.time,
    checkList: todo.checkList,
  });
  const isValid = state.description.length > 0;

  return (
    <Fieldset>
      <FieldGroup>
        <Field>
          <Label>Description</Label>
          <Textarea
            autoFocus
            name="description"
            rows={3}
            style={{ resize: "none" }}
            onChange={(event) =>
              setState({ ...state, description: event.target.value })
            }
            value={state.description}
          />
        </Field>
        <Field>
          <Label>Date</Label>
          <Input
            type="date"
            name="date"
            value={state.date ? format(state.date, "yyyy-MM-dd") : ""}
            onChange={(event) => {
              setState({
                ...state,
                date: event.target.value
                  ? new Date(event.target.value)
                  : undefined,
              });
            }}
          />
        </Field>
        <Field>
          <Label>Time</Label>
          <Input
            type="time"
            name="time"
            value={state.time || ""}
            onChange={(event) =>
              setState({ ...state, time: event.target.value })
            }
          />
        </Field>
        <Field>
          <Label>Checklist</Label>
          <div className="flex items-center my-4">
            <Checkbox checked={false} disabled />
            <Input
              type="text"
              placeholder="New item..."
              className="mx-4"
              value={newCheckListItemTitle}
              onChange={(event) => setNewCheckListItemTitle(event.target.value)}
              disabled={isSaving}
            />
            <Button
              disabled={isSaving}
              onClick={() => {
                setState({
                  ...state,
                  checkList: [
                    ...(state.checkList || []),
                    { title: newCheckListItemTitle, completed: false },
                  ],
                });
                setNewCheckListItemTitle("");
              }}
            >
              Add
            </Button>
          </div>
          <CheckboxGroup>
            {state.checkList?.map((item, index) => (
              <CheckboxField key={index}>
                <Checkbox checked={false} disabled />
                <Label>{item.title}</Label>
              </CheckboxField>
            ))}
          </CheckboxGroup>
        </Field>
        <Divider soft />
        <div className="flex justify-end">
          <Button plain onClick={() => navigate(-1)} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            className="ml-4"
            onClick={() => onSubmit(state)}
            disabled={isSaving || !isValid}
          >
            Save changes
          </Button>
        </div>
      </FieldGroup>
    </Fieldset>
  );

  /*
  return (
    <div>
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
          >
            <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
          </button>
          <h1 className="flex-2 text-lg font-medium text-center">Edit Todo</h1>
          <div className="flex-1 flex">
            <button
              type="submit"
              disabled={!isValid || isSaving}
              className="disabled:opacity-50 mx-autoinline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-auto"
              onClick={() => {
                onSubmit(state);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <textarea

          className="p-2 border-none block w-full focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Description..."

        />
        <div className="px-4 border-t border-gray-200  text-gray-500 text-lg font-medium ">
          {state.date ? (
            <div className="flex items-center  h-20">
              <CalendarIcon className="w-6 h-6 mr-2" />
              <input
                className="w-full flex-1 block  bg-white py-2 pr-3 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 focus:placeholder-gray-500 sm:text-sm"
                type="date"
                value={format(state.date || new Date(), "yyyy-MM-dd")}
                onChange={(event) =>
                  setState({ ...state, date: new Date(event.target.value) })
                }
              />
              <button
                onClick={() => setState({ ...state, date: undefined })}
                className="ml-3 p-3 inline-flex items-center justify-center  text-sm font-medium rounded text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setState({ ...state, date: new Date() })}
              className="mx-auto inline-flex items-center  h-20 w-full"
            >
              <CalendarIcon className="w-6 h-6 mr-2" /> Set Date
            </button>
          )}
        </div>
        <div className="px-4 border-t border-gray-200 text-gray-500 text-lg font-medium ">
          {state.time ? (
            <div className="flex items-center  h-20">
              <ClockIcon className="w-6 h-6 mr-2" />
              <input
                className="w-full flex-1 block  bg-white py-2 pr-3 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 focus:placeholder-gray-500 sm:text-sm"
                type="time"
                value={state.time}
                onChange={(event) =>
                  setState({ ...state, time: event.target.value })
                }
              />
              <button
                onClick={() => setState({ ...state, time: undefined })}
                className="ml-3 p-3 inline-flex items-center justify-center  text-sm font-medium rounded text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setState({ ...state, time: "09:00" })}
              className="mx-auto inline-flex items-center  h-20 w-full"
            >
              <ClockIcon className="w-6 h-6 mr-2" /> Set Time
            </button>
          )}
        </div>
        <div className="px-4 border-t border-gray-200 text-gray-500 text-lg font-medium ">
          {state.checkList ? (
            <div className="flex flex-col">
              <div className="flex items-center  h-20">
                <ClipboardIcon className="w-6 h-6 mr-2" />
                <div className="flex-grow">
                  <input
                    autoFocus
                    type="text"
                    value={newCheckListItemTitle}
                    onChange={(event) => {
                      setNewCheckListItemTitle(event.target.value);
                    }}
                    className="block w-full shadow-sm focus:ring-light-blue-500 focus:border-light-blue-500 sm:text-sm border-gray-300 rounded-md"
                    placeholder={`Title...`}
                    aria-describedby="add_team_members_helper"
                  />
                </div>
                <span className="ml-3">
                  <button
                    type="button"
                    className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                    onClick={() => {
                      setState({
                        ...state,
                        checkList: [
                          ...(state.checkList || []),
                          {
                            title: newCheckListItemTitle,
                            completed: false,
                          },
                        ],
                      });
                    }}
                  >
                    <PlusIcon
                      className="-ml-2 mr-1 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <span>Add</span>
                  </button>
                </span>
                <button
                  onClick={() => setState({ ...state, checkList: undefined })}
                  className="ml-3 p-3 inline-flex items-center justify-center  text-sm font-medium rounded text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              {state.checkList.length ? (
                <ul className="my-2">
                  {state.checkList.map(({ title }, index) => (
                    <li
                      key={index}
                      className="flex items-center text-lg py-1 px-1"
                    >
                      <input
                        type="checkbox"
                        disabled
                        className="rounded text-green-500 mr-2 opacity-50"
                      />
                      <label className="w-full">{title}</label>
                      <span
                        className="p-2 text-gray-300"
                        onClick={() =>
                          setState({
                            ...state,
                            checkList: state.checkList!.filter(
                              (_, i) => i !== index
                            ),
                          })
                        }
                      >
                        <TrashIcon className="w-6 h-6" />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <button
              onClick={() => setState({ ...state, checkList: [] })}
              className="mx-auto inline-flex items-center  h-20 w-full"
            >
              <ClipboardIcon className="w-6 h-6 mr-2" /> Add Check List
            </button>
          )}
        </div>
      </div>
    </div>
  );
  */
}

export function NewTodo() {
  const navigate = useNavigate();
  const familyScrum = useFamilyScrum();
  const addTodoMutation = familyScrum.todos.addTodoMutation;

  useEffect(addTodoMutation.subscribe, []);

  useEffect(() => {
    if (addTodoMutation.value) {
      navigate(-1);
    }
  }, [addTodoMutation.value]);

  return (
    <EditTodoPage
      todo={{
        description: "",
        date: undefined,
        time: undefined,
        checkList: undefined,
      }}
      isSaving={addTodoMutation.isPending}
      onSubmit={(data) => {
        addTodoMutation.mutate(data);
      }}
    />
  );
}

export function EditTodo() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    throw new Error("No id provided");
  }

  const navigate = useNavigate();
  const familyScrum = useFamilyScrum();
  const todoQuery = familyScrum.todos.queryTodo(id);
  const updateTodoMutation = familyScrum.todos.updateTodoMutation;

  useEffect(todoQuery.subscribe, []);

  useEffect(updateTodoMutation.subscribe, []);

  useEffect(() => {
    if (updateTodoMutation.value) {
      navigate(-1);
    }
  }, [updateTodoMutation.value]);

  if (todoQuery.isFetching) {
    return (
      <div className="bg-white flex flex-col h-screen">
        <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
          <div className="flex items-center">
            <div className="flex-1">
              <button
                onClick={() => navigate(-1)}
                className=" bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
              >
                <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <h1 className="flex-2 text-lg font-medium text-center">
              Edit Todo
            </h1>
            <div className="flex-1 flex">
              <button
                type="submit"
                className="ml-auto disabled:opacity-50 mx-autoinline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled
              >
                Save
              </button>
            </div>
          </div>
        </div>
        <div className="h-full overflow-y-scroll"></div>
      </div>
    );
  }

  if (todoQuery.error) {
    return <div>Can not find todo</div>;
  }

  return (
    <EditTodoPage
      todo={todoQuery.value}
      isSaving={updateTodoMutation.isPending}
      onSubmit={(data) => {
        updateTodoMutation.mutate(id, data);
      }}
    />
  );
}
