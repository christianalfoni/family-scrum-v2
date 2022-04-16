import React from "react";
import {
  CameraIcon,
  ChevronLeftIcon,
  ClipboardCheckIcon,
  CollectionIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { match } from "react-states";
import { DinnerDTO } from "../../environment-interface/storage";
import { useEditDinner } from "./useEditDinner";
import { useEnvironment } from "../../environment-interface";

export const EditDinner = ({
  onBackClick,
  dinner,
}: {
  dinner?: DinnerDTO;
  onBackClick: () => void;
}) => {
  const {
    dinner: [state, dispatch],
    image: [imageState, imageDispatch],
  } = useEditDinner({
    dinner,
    onExit: onBackClick,
  });

  const imageWrapperClassName =
    "flex h-40 bg-gray-500 items-center justify-center w-full";

  const renderImageFromSource = ({ src }: { src: string }) => (
    <div
      className={imageWrapperClassName}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
      onClick={() => {
        imageDispatch({
          type: "START_CAPTURE",
          videoId: state.dinner.id,
        });
      }}
    >
      <CameraIcon className="w-6 h-6 text-white" />
    </div>
  );

  return (
    <div className="bg-white flex flex-col h-screen">
      <div className="pl-4 pr-6 pt-4 pb-4 border-b border-t border-gray-200 sm:pl-6 lg:pl-8 xl:pl-6 xl:pt-6 xl:border-t-0">
        <div className="flex items-center">
          <div className="flex-1">
            <button
              onClick={onBackClick}
              className=" bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <h1 className="flex-2 text-lg font-medium">Add Dinner</h1>
          <span className="flex-1" />
        </div>
      </div>
      <div className="h-full overflow-y-scroll">
        {match(imageState, {
          LOADING: () => (
            <div className={imageWrapperClassName}>Loading...</div>
          ),
          LOADED: renderImageFromSource,
          CAPTURED: renderImageFromSource,
          CAPTURING: () => (
            <video
              id={state.dinner.id}
              className={imageWrapperClassName}
              onClick={() => {
                imageDispatch({
                  type: "CAPTURE",
                  videoId: state.dinner.id,
                });
              }}
            ></video>
          ),
          NOT_FOUND: () => (
            <div className={imageWrapperClassName}>
              <CameraIcon className="w-6 h-6 text-white" />
            </div>
          ),
        })}

        <div className="p-4 flex flex-col">
          <div className="col-span-12 sm:col-span-6">
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
              value={state.dinner.name}
              onChange={(event) => {
                dispatch({
                  type: "NAME_CHANGED",
                  name: event.target.value,
                });
              }}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <textarea
                rows={3}
                className="shadow-sm focus:ring-sky-500 focus:border-sky-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                value={state.dinner.description}
                onChange={(event) => {
                  dispatch({
                    type: "DESCRIPTION_CHANGED",
                    description: event.target.value,
                  });
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Ingredients
            </label>
            <div className="flex flex-col mt-1">
              <div className="flex items-center">
                <CollectionIcon className="w-6 h-6 mr-2" />
                <div className="flex-grow">
                  <input
                    type="text"
                    value={state.newIngredientName}
                    onChange={(event) => {
                      dispatch({
                        type: "NEW_INGREDIENT_NAME_CHANGED",
                        name: event.target.value,
                      });
                    }}
                    className="block w-full shadow-sm focus:ring-light-blue-500 focus:border-light-blue-500 sm:text-sm border-gray-300 rounded-md"
                    placeholder={`${"name"}...`}
                    aria-describedby="add_team_members_helper"
                  />
                </div>
                <span className="ml-3">
                  <button
                    type="button"
                    className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                    onClick={() => {
                      dispatch({
                        type: "ADD_INGREDIENT",
                      });
                    }}
                  >
                    <PlusIcon
                      className="-ml-2 mr-1 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <span>{"add"}</span>
                  </button>
                </span>
              </div>
              {state.dinner.groceries.length ? (
                <ul className="my-2">
                  {match(state, {
                    EDITING: ({ dinner }) =>
                      dinner.groceries.map((grocery, index) => (
                        <li
                          key={index}
                          className="flex items-center text-lg py-1 px-1"
                        >
                          <input
                            type="checkbox"
                            disabled
                            className="rounded text-green-500 mr-2 opacity-50"
                          />
                          <label className="w-full">{grocery}</label>
                          <span
                            className="p-2 text-gray-300"
                            onClick={() => {
                              dispatch({ type: "REMOVE_INGREDIENT", index });
                            }}
                          >
                            <TrashIcon className="w-6 h-6" />
                          </span>
                        </li>
                      )),
                  })}
                </ul>
              ) : null}
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Preparation list
            </label>
            <div className="flex flex-col mt-1">
              <div className="flex items-center">
                <ClipboardCheckIcon className="w-6 h-6 mr-2" />
                <div className="flex-grow">
                  <input
                    type="text"
                    value={state.newPreparationDescription}
                    onChange={(event) => {
                      dispatch({
                        type: "NEW_PREPARATION_ITEM_DESCRIPTION_CHANGED",
                        description: event.target.value,
                      });
                    }}
                    className="block w-full shadow-sm focus:ring-light-blue-500 focus:border-light-blue-500 sm:text-sm border-gray-300 rounded-md"
                    placeholder={`${"title"}...`}
                    aria-describedby="add_team_members_helper"
                  />
                </div>
                <span className="ml-3">
                  <button
                    type="button"
                    className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                    onClick={() => {
                      dispatch({
                        type: "ADD_PREPARATION_ITEM",
                      });
                    }}
                  >
                    <PlusIcon
                      className="-ml-2 mr-1 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <span>{"add"}</span>
                  </button>
                </span>
              </div>
              {state.dinner.preparationCheckList.length ? (
                <ul className="my-2">
                  {state.dinner.preparationCheckList.map((title, index) => (
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
                        onClick={() => {
                          dispatch({
                            type: "REMOVE_PREPARATION_ITEM",
                            index,
                          });
                        }}
                      >
                        <TrashIcon className="w-6 h-6" />
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Instructions
            </label>
            <div className="flex flex-col mt-1">
              {state.dinner.instructions.map((instruction, index) => (
                <div className="flex items-center" key={index}>
                  <span className="font-bold mr-2">{index + 1}.</span>
                  <div className="relative flex-grow">
                    <textarea
                      rows={3}
                      className="shadow-sm focus:ring-sky-500 focus:border-sky-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      value={instruction}
                      onChange={(event) => {
                        dispatch({
                          type: "INSTRUCTION_CHANGED",
                          instruction: event.target.value,
                          index,
                        });
                      }}
                    />
                    {index > 0 ? (
                      <button
                        type="button"
                        className="absolute bottom-2 right-2 bg-white inline-flex items-center p-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                        onClick={() => {
                          dispatch({
                            type: "REMOVE_INSTRUCTION",
                            index,
                          });
                        }}
                      >
                        <TrashIcon
                          className="h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
              <div
                className="flex items-center justify-center p-4 text-gray-500"
                onClick={() => {
                  dispatch({
                    type: "ADD_INSTRUCTION",
                  });
                }}
              >
                <PlusIcon className="w-4 h-4" /> Add instruction step
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="submit"
              disabled={match(state.validation, {
                INVALID: () => true,
                VALID: () => false,
              })}
              onClick={() => {
                dispatch({
                  type: "SAVE",
                });
              }}
              className="disabled:opacity-50 mx-autoinline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              {"save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
