import { useReducer, useState } from "react";
import {
    createContext,
    createHook,
    createReducer,
    useEnterEffect,
} from "react-states";
import { useDevtools } from "react-states/devtools";
import { useEnvironment } from "../../environment";
import { useDasbhoard } from "../DashboardFeature";
import { Groceries } from "../DashboardFeature/Feature";

type Context =
    | {
        state: "SHOPPING";
    }

type TransientContext = {
    state: 'SHOPPING_GROCERY'
    groceryId: string
}

type UIEvent =
    {
        type: 'SHOP_GROCERY'
        groceryId: string
    }

type Event = UIEvent;

const featureContext = createContext<Context, UIEvent, TransientContext>();


const reducer = createReducer<Context, Event, TransientContext>(
    {
        SHOPPING: {
            SHOP_GROCERY: ({ groceryId }) => ({
                state: 'SHOPPING_GROCERY',
                groceryId
            })
        }
    },
    {

        SHOPPING_GROCERY: (_, prevContext) => prevContext
    }
);

export const useFeature = createHook(featureContext);

export const selectors = {
    groceriesToShop(groceries: Groceries) {
        const groceriesToShop = Object.values(groceries).filter((grocery) => Boolean(grocery.shopCount))

        return groceriesToShop.map((grocery, index) => {
            if (!grocery.shopHistory) {
                return {
                    index,
                    sortFactor: 1
                }
            }
            // We get the different shopping list sizes
            const lengths = Object.keys(grocery.shopHistory).map(Number);
            // We calculate the priority of the grocery based on the length
            // of the list and when it was picked
            const sortFactors = lengths.map(
                (length) => grocery.shopHistory![length] / length
            );

            return {
                index,
                // The sort factor is an average of all prority based
                // calculations in different list lengths
                sortFactor:
                    sortFactors.reduce((aggr, val) => aggr + val, 0) / sortFactors.length
            };
        })
            .sort((a, b) => {
                if (a.sortFactor > b.sortFactor) {
                    return -1;
                } else if (a.sortFactor < b.sortFactor) {
                    return 1;
                }

                return 0;
            })
            .map(({ index }) => groceriesToShop[index]);
    }
}

export const Feature = ({
    children,
    familyId,
    initialContext = {
        state: "SHOPPING",
    },
}: {
    children: React.ReactNode;
    familyId: string;
    initialContext?: Context;
}) => {
    const { storage } = useEnvironment();
    const [dashboardContext] = useDasbhoard('LOADED')
    const feature = useReducer(reducer, initialContext);
    // We get the initial length of the grocery list, which is kept
    // as long as this feature is active
    const [shoppingListLength] = useState(() => Object.values(dashboardContext.groceries).filter((grocery) => Boolean(grocery.shopCount)).length)

    if (process.env.NODE_ENV === "development" && process.browser) {
        useDevtools("Groceries", feature);
    }

    const [context] = feature;

    useEnterEffect(context, 'SHOPPING_GROCERY', ({ groceryId }) => {
        storage.shopGrocery(familyId, groceryId, shoppingListLength)
    })

    return (
        <featureContext.Provider value={feature}>
            {children}
        </featureContext.Provider>
    );
};
