import { Functions, httpsCallable } from "firebase/functions";

export type GroceryToCategorize = {
  id: string;
  name: string;
};

export type CategorizedGrocery = {
  id: string;
  name: string;
  category: string;
};

export function AI(functions: Functions) {
  const categorize = httpsCallable<
    { groceries: Array<GroceryToCategorize> },
    Array<CategorizedGrocery>
  >(functions, "categorizeGroceries");

  return {
    categorizeGroceries,
  };

  function categorizeGroceries(groceries: Array<GroceryToCategorize>) {
    return categorize({ groceries }).then((result) => result.data);
  }
}
