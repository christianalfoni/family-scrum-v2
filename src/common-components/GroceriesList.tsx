import * as React from "react";
import { Menu, Transition } from "@headlessui/react";
import { dashboardSelectors } from "../features/DashboardFeature";
import { DotsVerticalIcon, QrcodeIcon } from "@heroicons/react/outline";
import { groceryCategoryToBackgroundColor } from "../utils";

import { Groceries, Barcodes } from "../features/DashboardFeature/Feature";
import { useGroceries } from "../features/GroceriesFeature";
import { match } from "react-states";
import { useTranslations } from "next-intl";

export const GroceriesList = ({
  groceries,
  barcodes,
}: {
  groceries: Groceries;
  barcodes: Barcodes;
}) => {
  const [groceriesFeature, send] = useGroceries();
  const t = useTranslations("GroceriesView");
  const sortedAndFilteredGroceries = match(groceriesFeature, {
    FILTERED: ({ category, input }) =>
      input
        ? dashboardSelectors.filterGroceriesByInput(
            Object.values(groceries),
            input
          )
        : dashboardSelectors.filterGroceriesByCategory(groceries, category),
    UNFILTERED: ({ input }) =>
      dashboardSelectors.filterGroceriesByInput(
        dashboardSelectors.groceriesByCategory(groceries),
        input
      ),
  });
  const barcodesByGroceryId = dashboardSelectors.barcodesByGroceryId(barcodes);
  const unlinkedBarcodes = dashboardSelectors.unlinkedBarcodes(barcodes);

  return (
    <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-auto h-full">
      {sortedAndFilteredGroceries.map((grocery) => {
        const color = groceryCategoryToBackgroundColor(grocery.category);
        return (
          <li
            key={grocery.id}
            onClick={() => {
              send({
                type: "INCREASE_SHOP_COUNT",
                id: grocery.id,
              });
            }}
            className="relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6"
          >
            <div className="flex items-center">
              <span
                className={`bg-${color}-300 h-4 w-4 rounded-full flex items-center justify-center`}
                aria-hidden="true"
              >
                <span className={`bg-${color}-500 h-2 w-2 rounded-full`} />
              </span>

              <span className="block ml-3">
                <h2 className="font-medium flex items-center">
                  {grocery.name}
                </h2>
              </span>

              <span className="font-normal ml-auto text-gray-500">
                {grocery.shopCount}
              </span>

              {barcodesByGroceryId[grocery.id] ? (
                <QrcodeIcon className="w-4 h-4 ml-2" />
              ) : null}

              <Menu as="div" className="ml-3 flex-shrink-0 pr-2">
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
                        className="z-10 mx-3 origin-top-right absolute right-10 top-3 w-48 mt-1 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-200 focus:outline-none"
                      >
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <a
                                onClick={(event) => {
                                  event.stopPropagation();
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
                                          groceryId: grocery.id,
                                          barcodeId,
                                        });
                                      }}
                                      className={`${
                                        active
                                          ? "bg-gray-100 text-gray-900"
                                          : "text-gray-700"
                                      }
                                 block px-4 py-2 text-sm`}
                                    >
                                      {t("unlinkBarcode")}{" "}
                                      {barcodeId.substr(0, 4)}...
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
                                 block px-4 py-2 text-sm`}
                                  >
                                    {t("linkBarcode")} {barcodeId.substr(0, 4)}
                                    ...
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
                                href="#"
                                className={`${
                                  active
                                    ? "bg-gray-100 text-gray-900"
                                    : "text-gray-700"
                                }
                                    block px-4 py-2 text-sm`}
                              >
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