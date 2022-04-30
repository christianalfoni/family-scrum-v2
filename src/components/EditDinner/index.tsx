import React from "react";
import {
  CameraIcon,
  ChevronLeftIcon,
  ClipboardCheckIcon,
  CollectionIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { match, PickState } from "react-states";
import { DinnerDTO } from "../../environment-interface/storage";
import { useEditDinner } from "./useEditDinner";
import { ImageState } from "../../useImage";
import { useTranslations } from "next-intl";

export const EditDinner = ({
  onBackClick,
  initialDinner,
}: {
  initialDinner?: DinnerDTO;
  onBackClick: () => void;
}) => {
  const {
    dinner: [state, dispatch],
    image: [imageState, imageDispatch],
  } = useEditDinner({
    initialDinner,
    onExit: onBackClick,
  });
  const t = useTranslations("DinnerView");

  const {
    dinner,
    NAME_CHANGED,
    DESCRIPTION_CHANGED,
    NEW_INGREDIENT_NAME_CHANGED,
    ADD_INGREDIENT,
    ADD_INSTRUCTION,
    ADD_PREPARATION_ITEM,
    INSTRUCTION_CHANGED,
    NEW_PREPARATION_ITEM_DESCRIPTION_CHANGED,
    REMOVE_INGREDIENT,
    REMOVE_INSTRUCTION,
    REMOVE_PREPARATION_ITEM,
    SAVE,
    newIngredientName,
    newPreparationDescription,
    validation,
  } = state;

  const imageWrapperClassName =
    "flex h-40 bg-gray-500 items-center justify-center w-full text-gray-300";

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
          <h1 className="flex-2 text-lg font-medium">{t("addDinner")}</h1>
          <span className="flex-1" />
        </div>
      </div>
      <div className="h-full overflow-y-scroll">
        {match(
          imageState,
          {
            LOADING: () => <div className={imageWrapperClassName}>...</div>,
            CAPTURING: ({ CAPTURE }) => (
              <video
                id={dinner.id}
                className={imageWrapperClassName}
                onClick={() => imageDispatch(CAPTURE(dinner.id))}
              ></video>
            ),
            NOT_FOUND: ({ START_CAPTURE }) => (
              <div
                className={imageWrapperClassName}
                onClick={() => imageDispatch(START_CAPTURE(dinner.id))}
              >
                <CameraIcon className="w-6 h-6 text-white" />
              </div>
            ),
          },
          ({ START_CAPTURE, src }) => (
            <div
              className={imageWrapperClassName}
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: "cover",
                backgroundPosition: "center center",
              }}
              onClick={() => imageDispatch(START_CAPTURE(dinner.id))}
            >
              <CameraIcon className="w-6 h-6 text-white" />
            </div>
          )
        )}

        <div className="p-4 flex flex-col">
          <div className="col-span-12 sm:col-span-6">
            <label
              htmlFor="first_name"
              className="block text-sm font-medium text-gray-700"
            >
              {t("name")}
            </label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
              value={dinner.name}
              onChange={(event) => dispatch(NAME_CHANGED(event.target.value))}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              {t("description")}
            </label>
            <div className="mt-1">
              <textarea
                rows={3}
                className="shadow-sm focus:ring-sky-500 focus:border-sky-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                value={dinner.description}
                onChange={(event) =>
                  dispatch(DESCRIPTION_CHANGED(event.target.value))
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              {t("ingredients")}
            </label>
            <div className="flex flex-col mt-1">
              <div className="flex items-center">
                <CollectionIcon className="w-6 h-6 mr-2" />
                <div className="flex-grow">
                  <input
                    type="text"
                    value={newIngredientName}
                    onChange={(event) =>
                      dispatch(NEW_INGREDIENT_NAME_CHANGED(event.target.value))
                    }
                    className="block w-full shadow-sm focus:ring-light-blue-500 focus:border-light-blue-500 sm:text-sm border-gray-300 rounded-md"
                    placeholder={`${"name"}...`}
                    aria-describedby="add_team_members_helper"
                  />
                </div>
                <span className="ml-3">
                  <button
                    type="button"
                    className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                    onClick={() => dispatch(ADD_INGREDIENT())}
                  >
                    <PlusIcon
                      className="-ml-2 mr-1 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <span>{"add"}</span>
                  </button>
                </span>
              </div>
              {dinner.groceries.length ? (
                <ul className="my-2">
                  {dinner.groceries.map((grocery, index) => (
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
                        onClick={() => dispatch(REMOVE_INGREDIENT(index))}
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
              {t("preparationList")}
            </label>
            <div className="flex flex-col mt-1">
              <div className="flex items-center">
                <ClipboardCheckIcon className="w-6 h-6 mr-2" />
                <div className="flex-grow">
                  <input
                    type="text"
                    value={newPreparationDescription}
                    onChange={(event) =>
                      dispatch(
                        NEW_PREPARATION_ITEM_DESCRIPTION_CHANGED(
                          event.target.value
                        )
                      )
                    }
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
                      dispatch(ADD_PREPARATION_ITEM());
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
              {dinner.preparationCheckList.length ? (
                <ul className="my-2">
                  {dinner.preparationCheckList.map((title, index) => (
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
                        onClick={() => dispatch(REMOVE_PREPARATION_ITEM(index))}
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
              {t("instructions")}
            </label>
            <div className="flex flex-col mt-1">
              {dinner.instructions.map((instruction, index) => (
                <div className="flex items-center" key={index}>
                  <span className="font-bold mr-2">{index + 1}.</span>
                  <div className="relative flex-grow">
                    <textarea
                      rows={3}
                      className="shadow-sm focus:ring-sky-500 focus:border-sky-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      value={instruction}
                      onChange={(event) =>
                        dispatch(
                          INSTRUCTION_CHANGED({
                            instruction: event.target.value,
                            index,
                          })
                        )
                      }
                    />
                    {index > 0 ? (
                      <button
                        type="button"
                        className="absolute bottom-2 right-2 bg-white inline-flex items-center p-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                        onClick={() => dispatch(REMOVE_INSTRUCTION(index))}
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
                onClick={() => dispatch(ADD_INSTRUCTION())}
              >
                <PlusIcon className="w-4 h-4" /> {t("addInstructionStep")}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="submit"
              className="disabled:opacity-50 mx-autoinline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              {...match(validation, {
                INVALID: () => ({
                  disabled: true,
                }),
                VALID: () => ({
                  disabled: false,
                  onClick: () => dispatch(SAVE()),
                }),
              })}
            >
              {"save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
