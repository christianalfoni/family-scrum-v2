import { useDasbhoard } from "../features/DashboardFeature";
import confetti from 'canvas-confetti'

import React, { useEffect } from "react";
import { groceriesShoppingSelectors, useGroceriesShopping } from "../features/GroceriesShoppingFeature";
import { ChevronLeftIcon, LightBulbIcon } from "@heroicons/react/outline";
import { LightBulbIcon as SolidLightBulbIcon } from "@heroicons/react/solid";
import { useTranslations } from "next-intl";
import { match } from "react-states";
import { useEnvironment } from "../environment";


export const GroceriesShoppingView = ({ onBackClick }: { onBackClick: () => void }) => {
    const { preventScreenSleep } = useEnvironment()
    const [dashboardFeature] = useDasbhoard('LOADED')
    const t = useTranslations("GroceriesShoppingView");
    const [groceriesShopping, send] = useGroceriesShopping();
    const groceriesToShop = groceriesShoppingSelectors.groceriesToShop(dashboardFeature.groceries)

    useEffect(() => {
        if (!groceriesToShop.length) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [groceriesToShop.length])

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
                    <h1 className="flex-2 text-lg font-medium">{t("shoppingList")}</h1>
                    <span className="flex-1" />
                    <button
                        onClick={() => {
                            send({
                                type: 'TOGGLE_NO_SLEEP'
                            })
                            match(groceriesShopping, {
                                LIST: () => {
                                    preventScreenSleep.enable()

                                },
                                NO_SLEEP: () => {
                                    preventScreenSleep.disable()
                                }
                            })
                        }}
                        className="mx-auto inline-flex items-center justify-center border border-transparent text-sm font-medium rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        {match(groceriesShopping, {
                            LIST: () => <LightBulbIcon className="w-6 h-6" />,
                            NO_SLEEP: () => <SolidLightBulbIcon className="w-6 h-6 text-yellow-500" />
                        })}
                    </button>
                </div>
            </div>
            <ul className="relative z-0 divide-y divide-gray-200 border-b border-gray-200 overflow-y-scroll">
                {groceriesToShop.map((grocery) => {
                    return (
                        <li
                            key={grocery.id}
                            onClick={() => {
                                send({
                                    type: "SHOP_GROCERY",
                                    groceryId: grocery.id,
                                });
                            }}
                            className="relative pl-4 pr-6 py-5 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6"
                        >
                            <div className="flex items-center">
                                <span className="text-sm text-gray-500 group-hover:text-gray-900 font-medium truncate">
                                    {grocery.shopCount}
                                </span>
                                <span className="block ml-3">
                                    <h2 className="font-medium">
                                        <span className="absolute inset-0" aria-hidden="true" />
                                        {grocery.name}
                                    </h2>
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};