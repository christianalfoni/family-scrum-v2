import { useDasbhoard } from "../features/DashboardFeature";
import confetti from 'canvas-confetti'

import { useEffect, useState } from "react";
import { groceriesShoppingSelectors, useGroceriesShopping } from "../features/GroceriesShoppingFeature";


export const GroceriesShoppingList = () => {
    const [dashboardFeature] = useDasbhoard('LOADED')
    const [, send] = useGroceriesShopping();
    const groceriesToShop = groceriesShoppingSelectors.groceriesToShop(dashboardFeature.groceries)
    const [shoppingListLength] = useState(groceriesToShop.length)

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
    );
};