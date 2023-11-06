import { context } from "impact-context";
import { DinnerDTO } from "../../useGlobalContext/firebase";
import { signal } from "impact-signal";
import { useGlobalContext } from "../../useGlobalContext";
import { useAppContext } from "../useAppContext";
import { produce } from "immer";

function EditDinnerContext({ dinner: initialDinner }: { dinner?: DinnerDTO }) {
  const { firebase } = useGlobalContext();
  const { user } = useAppContext();
  const dinnersCollection = firebase.collections.dinners(user.familyId);
  const newGroceryName = signal("");
  const newPreparationDescription = signal("");

  const dinner = signal<DinnerDTO>(
    initialDinner || {
      id: firebase.createId(dinnersCollection),
      created: firebase.createServerTimestamp(),
      description: "",
      groceries: [],
      instructions: [""],
      modified: firebase.createServerTimestamp(),
      name: "",
      preparationCheckList: [],
    },
  );

  return {
    get isValid() {
      return Boolean(dinner.value.description.length);
    },
    get id() {
      return dinner.value.id;
    },
    get name() {
      return dinner.value.name;
    },
    get description() {
      return dinner.value.description;
    },
    get groceries() {
      return dinner.value.groceries;
    },
    get instructions() {
      return dinner.value.instructions;
    },
    get preparationCheckList() {
      return dinner.value.preparationCheckList;
    },
    get newPreparationDescription() {
      return newPreparationDescription.value;
    },
    changeNewPreperationDescription(description: string) {
      newPreparationDescription.value = description;
    },
    addPreparation() {
      if (!newPreparationDescription.value) {
        return;
      }

      produce(dinner.value, (draft) => {
        draft.preparationCheckList.push(newPreparationDescription.value);
      });

      newPreparationDescription.value = "";
    },
    removePreparation(index: number) {
      produce(dinner.value, (draft) => {
        draft.preparationCheckList.splice(index, 1);
      });
    },
    get newGroceryName() {
      return newGroceryName.value;
    },
    changeNewGroceryName(name: string) {
      newGroceryName.value = name;
    },
    addGrocery() {
      if (!newGroceryName.value) {
        return;
      }

      produce(dinner.value, (draft) => {
        draft.groceries.push(newGroceryName.value);
      });

      newGroceryName.value = "";
    },
    removeGrocery(index: number) {
      produce(dinner.value, (draft) => {
        draft.groceries.splice(index, 1);
      });
    },
    changeInstructionDescription(index: number, description: string) {
      produce(dinner.value, (draft) => {
        draft.instructions[index] = description;
      });
    },
    addInstruction() {
      produce(dinner.value, (draft) => {
        draft.instructions.push("");
      });
    },
    removeInstruction(index: number) {
      produce(dinner.value, (draft) => {
        draft.instructions.splice(index, 1);
      });
    },
    changeName(name: string) {
      produce(dinner.value, (draft) => {
        draft.name = name;
      });
    },
    changeDescription(description: string) {
      produce(dinner.value, (draft) => {
        draft.description = description;
      });
    },
    submit() {},
  };
}

export const useEditDinnerContext = context(EditDinnerContext);
