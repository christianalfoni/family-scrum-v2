import { useEffect, useState } from "react";
import {
  CameraIcon,
  ChevronLeftIcon,
  CheckIcon,
  ArchiveBoxIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { useFamilyScrum } from "./FamilyScrumContext";
import { useNavigate, useParams } from "react-router";
import { DinnerDTO } from "../environment/Persistence";

function DinnerImage({ imageRef }: { imageRef?: string }) {
  const familyScrum = useFamilyScrum();
  const camera = familyScrum.camera;
  const dinnerImageQuery = imageRef
    ? familyScrum.dinners.queryDinnerImage(imageRef)
    : null;

  const imageWrapperClassName =
    "flex h-40 bg-gray-500 items-center justify-center w-full text-gray-300";
  const videoId = "dinner-capture";

  if (dinnerImageQuery?.isFetching || camera.state.current === "STARTING") {
    return <div className={imageWrapperClassName}>...</div>;
  }

  if (camera.state.current === "STARTED") {
    const cameraState = camera.state;

    return (
      <video
        autoPlay
        playsInline
        id={videoId}
        className={imageWrapperClassName}
        onClick={() => cameraState.capture(videoId, 100, 100)}
      ></video>
    );
  }

  if (camera.state.current === "CAPTURED") {
    return (
      <video
        autoPlay
        playsInline
        id={videoId}
        className={imageWrapperClassName}
      >
        <div className={imageWrapperClassName}>...</div>,
      </video>
    );
  }

  if (!dinnerImageQuery?.value) {
    const cameraState = camera.state;

    return (
      <div
        className={imageWrapperClassName}
        onClick={() => cameraState.start(videoId)}
      >
        <CameraIcon className="w-6 h-6 text-white" />
      </div>
    );
  }

  return (
    <div
      className={imageWrapperClassName}
      style={{
        backgroundImage: `url(${dinnerImageQuery.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center center",
      }}
    >
      <CameraIcon className="w-6 h-6 text-white" />
    </div>
  );
}

type DinnerData = Omit<DinnerDTO, "id" | "imageRef" | "created" | "modified">;

function DinnerPage({
  initialData,
  onSubmit,
}: {
  initialData?: DinnerDTO;
  onSubmit: (data: DinnerData) => void;
}) {
  const navigate = useNavigate();
  const [newGroceryName, setNewGroceryName] = useState("");
  const [newPreparationDescription, setNewPreparationDescription] =
    useState("");
  const [data, setData] = useState<DinnerData>(
    initialData || {
      name: "",
      description: "",
      preparationCheckList: [],
      groceries: [],
      instructions: [],
    }
  );
  const isValid = data.description.length > 0;

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
            {initialData ? "Edit Dinner" : "Add Dinner"}
          </h1>
          <div className="flex-1 flex">
            <button
              type="submit"
              className="ml-auto disabled:opacity-50 mx-autoinline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              {...(isValid
                ? { onClick: () => onSubmit(data) }
                : { disabled: true })}
            >
              Save
            </button>
          </div>
        </div>
      </div>
      <div className="h-full overflow-y-scroll">
        <DinnerImage imageRef={initialData?.imageRef} />

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
              value={data.name}
              onChange={(event) =>
                setData({ ...data, name: event.target.value })
              }
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
                value={data.description}
                onChange={(event) =>
                  setData({ ...data, description: event.target.value })
                }
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Ingredients
            </label>
            <div className="flex flex-col mt-1">
              <div className="flex items-center">
                <ArchiveBoxIcon className="w-6 h-6 mr-2" />
                <div className="flex-grow">
                  <input
                    type="text"
                    value={newGroceryName}
                    onChange={(event) => setNewGroceryName(event.target.value)}
                    className="block w-full shadow-sm focus:ring-light-blue-500 focus:border-light-blue-500 sm:text-sm border-gray-300 rounded-md"
                    placeholder={`Name...`}
                    aria-describedby="add_team_members_helper"
                  />
                </div>
                <span className="ml-3">
                  <button
                    type="button"
                    className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                    onClick={() => {
                      setData({
                        ...data,
                        groceries: [...data.groceries, newGroceryName],
                      });
                      setNewGroceryName("");
                    }}
                  >
                    <PlusIcon
                      className="-ml-2 mr-1 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <span>Add</span>
                  </button>
                </span>
              </div>
              {data.groceries.length ? (
                <ul className="my-2">
                  {data.groceries.map((grocery, index) => (
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
                          setData({
                            ...data,
                            groceries: data.groceries.filter(
                              (_, i) => i !== index
                            ),
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
              Preparation List
            </label>
            <div className="flex flex-col mt-1">
              <div className="flex items-center">
                <CheckIcon className="w-6 h-6 mr-2" />
                <div className="flex-grow">
                  <input
                    type="text"
                    value={newPreparationDescription}
                    onChange={(event) =>
                      setNewPreparationDescription(event.target.value)
                    }
                    className="block w-full shadow-sm focus:ring-light-blue-500 focus:border-light-blue-500 sm:text-sm border-gray-300 rounded-md"
                    placeholder={`Description...`}
                    aria-describedby="add_team_members_helper"
                  />
                </div>
                <span className="ml-3">
                  <button
                    type="button"
                    className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                    onClick={() => {
                      setData({
                        ...data,
                        preparationCheckList: [
                          ...data.preparationCheckList,
                          newPreparationDescription,
                        ],
                      });
                      setNewPreparationDescription("");
                    }}
                  >
                    <PlusIcon
                      className="-ml-2 mr-1 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <span>Add</span>
                  </button>
                </span>
              </div>
              {data.preparationCheckList.length ? (
                <ul className="my-2">
                  {data.preparationCheckList.map((title, index) => (
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
                          setData({
                            ...data,
                            preparationCheckList:
                              data.preparationCheckList.filter(
                                (_, i) => i !== index
                              ),
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
              {data.instructions.map((instruction, index) => (
                <div className="flex items-center" key={index}>
                  <span className="font-bold mr-2">{index + 1}.</span>
                  <div className="relative flex-grow">
                    <textarea
                      rows={3}
                      className="shadow-sm focus:ring-sky-500 focus:border-sky-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      value={instruction}
                      onChange={(event) =>
                        setData({
                          ...data,
                          instructions: data.instructions.map((_, i) =>
                            i === index ? event.target.value : _
                          ),
                        })
                      }
                    />
                    {index > 0 ? (
                      <button
                        type="button"
                        className="absolute bottom-2 right-2 bg-white inline-flex items-center p-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
                        onClick={() =>
                          setData({
                            ...data,
                            instructions: data.instructions.filter(
                              (_, i) => i !== index
                            ),
                          })
                        }
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
                  setData({
                    ...data,
                    instructions: [...data.instructions, ""],
                  });
                }}
              >
                <PlusIcon className="w-4 h-4" /> Add Instruction Step
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NewDinner() {
  const familyScrum = useFamilyScrum();
  const addDinnerMutation = familyScrum.dinners.addDinnerMutation;

  return (
    <DinnerPage
      onSubmit={(dinner) => {
        addDinnerMutation.mutate(dinner);
      }}
    />
  );
}

export function EditDinner() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    throw new Error("Invalid use of EditDinner, need an id");
  }

  const navigate = useNavigate();
  const familyScrum = useFamilyScrum();
  const dinnerQuery = familyScrum.dinners.queryDinner(id);
  const updateDinnerMutation = familyScrum.dinners.updateDinnerMutation;

  useEffect(dinnerQuery.subscribe, []);

  if (dinnerQuery.isFetching) {
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
            <h1 className="flex-2 text-lg font-medium text-center"></h1>
            <div className="flex-1 flex">
              <button
                type="submit"
                className="ml-auto disabled:opacity-50 mx-autoinline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
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

  if (dinnerQuery.error) {
    return <div>Can not find dinner</div>;
  }

  return (
    <DinnerPage
      initialData={dinnerQuery.value}
      onSubmit={(dinner) => {
        updateDinnerMutation.mutate(id, dinner);
      }}
    />
  );
}
