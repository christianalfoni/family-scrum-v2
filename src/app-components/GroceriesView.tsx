import * as React from "react";
import { useTranslations } from "next-intl";
import { useDasbhoard } from "../features/DashboardFeature";
import {
  CameraIcon,
  ChevronLeftIcon,
  PlusIcon,
  SearchIcon,
} from "@heroicons/react/outline";

import { useGroceries } from "../features/GroceriesFeature";
import { match } from "react-states";

import { GroceriesList } from "./GroceriesList";
import { Dialog, Transition } from "@headlessui/react";
import { useCapture } from "../features/CaptureFeature";
import { useEnvironment } from "../environment";

const VIDEO_ID = "capture-video";

const CaptureModal = () => {
  const [capture, send] = useCapture();

  const open = match(capture, {
    CAPTURING: () => true,
    AWAITING_VIDEO: () => true,
    IDLE: () => false,
  });

  React.useEffect(() => {
    if (open) {
      send({ type: "VIDEO_LOADED", id: VIDEO_ID });
    }
  }, [open]);

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-30 inset-0 overflow-y-auto"
        open={open}
        onClose={() => {}}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-middle rounded-lg bg-black text-left overflow-hidden shadow-xl transform transition-all ">
              <video id={VIDEO_ID} className="w-96 h-96 rounded-lg m-2"></video>
              <button
                type="button"
                onClick={() => {
                  send({
                    type: "CAPTURE",
                    id: VIDEO_ID,
                  });
                }}
                className="absolute top-0 left-0 w-full h-full bg-transparent z-10 flex items-center justify-center"
              >
                <CameraIcon className="text-white w-10 h-10 opacity-70" />
              </button>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export const GroceriesView = ({ onBackClick }: { onBackClick: () => void }) => {
  const [dashboardFeature] = useDasbhoard("LOADED");
  const [groceriesFeature, send] = useGroceries();
  const t = useTranslations("GroceriesView");
  const { groceries, barcodes } = dashboardFeature;

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
          <h1 className="flex-2 text-lg font-medium">{t("groceries")}</h1>
          <span className="flex-1" />
        </div>
      </div>
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="w-full">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <SearchIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <input
              id="search"
              name="search"
              value={match(groceriesFeature, {
                FILTERED: ({ input }) => input,
                UNFILTERED: () => "",
              })}
              onChange={(event) => {
                send({
                  type: "GROCERY_INPUT_CHANGED",
                  input: event.target.value,
                });
              }}
              className="block w-full bg-white border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
              placeholder={t("filterNewGrocery") as string}
              type="search"
            />
          </div>
        </div>
        <span className="ml-3">
          <button
            type="button"
            disabled={match(groceriesFeature, {
              UNFILTERED: () => true,
              FILTERED: ({ input }) => (input ? false : true),
            })}
            onClick={() => {
              send({
                type: "ADD_GROCERY",
              });
            }}
            className="disabled:opacity-50 bg-white whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
          >
            <PlusIcon
              className="-ml-2 mr-1 h-5 text-gray-400"
              aria-hidden="true"
            />
            <span>{t("add")}</span>
          </button>
        </span>
      </div>
      <GroceriesList groceries={groceries} barcodes={barcodes} />
      <CaptureModal />
    </div>
  );
};
