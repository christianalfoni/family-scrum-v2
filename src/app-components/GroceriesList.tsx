import * as React from "react";
import { Menu, Transition } from "@headlessui/react";
import { groceriesSelectors } from "../features/GroceriesFeature";
import {
  CameraIcon,
  DotsVerticalIcon,
  QrcodeIcon,
  TrashIcon,
} from "@heroicons/react/outline";

import { Groceries, Barcodes } from "../features/DashboardFeature/Feature";
import { useGroceries } from "../features/GroceriesFeature";
import { match } from "react-states";
import { useTranslations } from "next-intl";
import { useCapture } from "../features/CaptureFeature";

export const GroceriesList = ({
  groceries,
  barcodes,
  onGroceryClick,
}: {
  groceries: Groceries;
  barcodes: Barcodes;
  onGroceryClick: (id: string) => void;
}) => {
  const [now] = React.useState(Date.now());
  const [, sendCapture] = useCapture();
  const [groceriesFeature, send] = useGroceries();
  const t = useTranslations("GroceriesView");
  const sortedAndFilteredGroceries = match(groceriesFeature, {
    FILTERED: ({ input }) =>
      groceriesSelectors.filteredGroceriesByInput(
        Object.values(groceries),
        input
      ),
    UNFILTERED: () =>
      groceriesSelectors.sortedGroceriesByNameAndCreated(groceries, now),
  });
  const barcodesByGroceryId = groceriesSelectors.barcodesByGroceryId(barcodes);
  const unlinkedBarcodes = groceriesSelectors.unlinkedBarcodes(barcodes);

  return (
    <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-auto h-full">
      {sortedAndFilteredGroceries.map((grocery) => {
        return (
          <li
            key={grocery.id}
            onClick={() => onGroceryClick(grocery.id)}
            className="relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6"
          >
            <div className="flex items-center">
              <span
                className={`${
                  grocery.shopCount
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                } w-6 justify-center  inline-flex items-center px-1 py-0.5 rounded-full text-xs font-medium capitalize`}
              >
                {grocery.shopCount}
              </span>
              {grocery.image ? (
                <img
                  src={grocery.image}
                  width={32}
                  height={32}
                  className="rounded-md border-yellow-300 border ml-3"
                />
              ) : null}
              <span className="block ml-3">
                <h2 className="font-medium flex items-center">
                  {grocery.name}
                </h2>
              </span>

              {barcodesByGroceryId[grocery.id] ? (
                <QrcodeIcon className="w-4 h-4 ml-3" />
              ) : null}

              <Menu
                as="div"
                className="ml-auto flex-shrink-0 pr-2"
                onClick={(event: any) => {
                  event.stopPropagation();
                }}
              >
                {({ open }) => (
                  <>
                    <Menu.Button className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                      <span className="sr-only">Open options</span>
                      <DotsVerticalIcon
                        className="w-5 h-5"
                        aria-hidden="true"
                      />
                    </Menu.Button>
                    <Transition
                      show={open}
                      as={React.Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items
                        static
                        className="z-10 mx-8 origin-top-right absolute right-10 top-3 w-56 mt-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none"
                      >
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={() => {
                                  send({
                                    type: "RESET_SHOP_COUNT",
                                    id: grocery.id,
                                  });
                                }}
                                className={`${
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                }
                                    block px-4 py-2 text-sm`}
                              >
                                {t("resetShopCount")}
                              </a>
                            )}
                          </Menu.Item>
                        </div>
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={() => {
                                  sendCapture({
                                    type: "START_CAPTURE",
                                    groceryId: grocery.id,
                                  });
                                }}
                                className={`${
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                }
                                    px-4 py-2 text-sm flex items-center`}
                              >
                                <CameraIcon className="w-4 h-4 mr-2" /> Capture
                                image
                              </a>
                            )}
                          </Menu.Item>
                        </div>
                        {barcodesByGroceryId[grocery.id] ? (
                          <div className="py-1">
                            {barcodesByGroceryId[grocery.id].map(
                              (barcodeId) => (
                                <Menu.Item key={barcodeId}>
                                  {({ active }) => (
                                    <a
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        send({
                                          type: "UNLINK_BARCODE",
                                          barcodeId,
                                        });
                                      }}
                                      className={`${
                                        active
                                          ? "bg-gray-100 text-gray-900"
                                          : "text-gray-700"
                                      }
                                  px-4 py-2 text-sm flex items-center`}
                                    >
                                      <QrcodeIcon className="w-4 h-4 mr-2" />{" "}
                                      {t("unlinkBarcode")} ...
                                      {barcodeId.substr(
                                        barcodeId.length - 5,
                                        4
                                      )}
                                    </a>
                                  )}
                                </Menu.Item>
                              )
                            )}
                          </div>
                        ) : null}
                        {unlinkedBarcodes.length ? (
                          <div className="py-1">
                            {unlinkedBarcodes.map((barcodeId) => (
                              <Menu.Item key={barcodeId}>
                                {({ active }) => (
                                  <a
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      send({
                                        type: "LINK_BARCODE",
                                        groceryId: grocery.id,
                                        barcodeId,
                                      });
                                    }}
                                    className={`${
                                      active
                                        ? "bg-gray-100 text-gray-900"
                                        : "text-gray-700"
                                    }
                                  px-4 py-2 text-sm flex items-center`}
                                  >
                                    <QrcodeIcon className="w-4 h-4 mr-2" />{" "}
                                    {t("linkBarcode")} ...
                                    {barcodeId.substr(barcodeId.length - 5, 4)}
                                  </a>
                                )}
                              </Menu.Item>
                            ))}
                          </div>
                        ) : null}
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={() => {
                                  send({
                                    type: "DELETE_GROCERY",
                                    groceryId: grocery.id,
                                  });
                                }}
                                className={`${
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                }
                                    px-4 py-2 text-sm flex items-center`}
                              >
                                <TrashIcon className="w-4 h-4 mr-2" />{" "}
                                {t("delete")}
                              </a>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </>
                )}
              </Menu>
            </div>
          </li>
        );
      })}
    </ul>
  );
};
