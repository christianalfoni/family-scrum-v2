import {
  MagnifyingGlassIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/solid";
import { Suspense, use, useEffect, useState } from "react";
import { useFamilyScrum } from "./FamilyScrumContext";
import { Input, InputGroup } from "@/components/input";
import { Button } from "@/components/button";
import { Text } from "@/components/text";
import { GroceryDTO } from "@/environment/Persistence";
import { Divider } from "@/components/divider";

/*
      | "red"
      | "orange"
      | "amber"
      | "yellow"
      | "lime"
      | "green"
      | "emerald"
      | "teal"
      | "cyan"
      | "sky"
      | "blue"
      | "indigo"
      | "violet"
      | "purple"
      | "fuchsia"
      | "pink"
      | "rose"
      | "zinc";
  
*/

const categories = [
  "produce",
  "dairy",
  "meat and fish",
  "bakery",
  "frozen",
  "packaged and processed",
  "beverages",
  "household and non food items",
  "candy",
];

function GroceriesShopping() {
  const familyScrum = useFamilyScrum();
  const groceries = familyScrum.groceries;
  const categorizedGroceries = use(groceries.categorizedGroceriesQuery.promise);

  useEffect(groceries.categorizedGroceriesQuery.subscribe, []);

  // Sort groceries by category order
  const sortedGroceries = [...categorizedGroceries].sort((a, b) => {
    const aIndex = categories.indexOf(a.category);
    const bIndex = categories.indexOf(b.category);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return sortedGroceries.reduce<React.ReactNode[]>(
    (acc, grocery, index, array) => {
      const prevGrocery = array[index - 1];

      let heading: React.ReactNode = null;

      if (prevGrocery && prevGrocery.category !== grocery.category) {
        heading = <Divider key={index} />;
      }

      return [
        ...acc,
        heading,
        <ShopGrocery
          key={grocery.id}
          name={grocery.name}
          onClick={() => groceries.shopGrocery.mutate(grocery.id)}
        />,
      ];
    },
    []
  );
}

function GroceriesList({ groceries }: { groceries: GroceryDTO[] }) {
  return groceries.map((grocery) => (
    <div key={grocery.id} className="flex items-center gap-2 py-2">
      <Text className="flex-auto">{grocery.name}</Text>
    </div>
  ));
}

export function Groceries() {
  const familyScrum = useFamilyScrum();
  const awake = familyScrum.awake;
  const groceries = familyScrum.groceries;
  const [filter, setFilter] = useState("");
  const [isShopping, setIsShopping] = useState(false);
  const pendingGroceryName = groceries.addGrocery.pendingParams?.[0];

  useEffect(groceries.subscribe, []);

  useEffect(() => {
    if (isShopping) {
      awake.on();
    } else {
      awake.off();
    }
  }, [isShopping]);

  return (
    <>
      <div className="flex items-center gap-2">
        <InputGroup>
          <MagnifyingGlassIcon />
          <Input
            name="search"
            placeholder="Add/Filter&hellip;"
            aria-label="Search"
            value={filter}
            disabled={isShopping}
            onChange={(e) => setFilter(e.target.value)}
          />
        </InputGroup>
        <Button
          onClick={() => {
            groceries.addGrocery.mutate(filter);
            setFilter("");
          }}
          disabled={!!pendingGroceryName || !filter}
        >
          Add
        </Button>
        <Button
          color={isShopping ? "yellow" : "dark"}
          onClick={() => setIsShopping(!isShopping)}
        >
          {isShopping ? (
            <ShoppingCartIcon className="w-6 h-6" />
          ) : (
            <ShoppingCartIcon className="w-6 h-6" />
          )}
        </Button>
      </div>
      <div className="mt-4">
        {pendingGroceryName ? (
          <div className="flex items-center gap-2 py-2 opacity-50">
            <Text className="flex-auto">{pendingGroceryName}</Text>
          </div>
        ) : null}
        {isShopping ? (
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-36">
                <Text
                  className="text-center text-lg opacity-25 animate-pulse animate-fade-in"
                  style={{
                    animationDelay: "0.5s",
                  }}
                >
                  Mapping groceries to store layout...
                </Text>
              </div>
            }
          >
            <GroceriesShopping />
          </Suspense>
        ) : (
          <GroceriesList groceries={groceries.filterGroceries(filter)} />
        )}
      </div>
    </>
  );
}

function ShopGrocery({
  name,
  onClick,
}: {
  name: string;

  onClick?: () => void;
}) {
  return (
    <div onClick={onClick} className="flex items-center gap-2 py-2 px-1.5">
      <Text className="flex-auto">{name}</Text>
      <Button plain onClick={onClick}>
        <ShoppingCartIcon className="w-6 h-6" />
      </Button>
    </div>
  );
}
