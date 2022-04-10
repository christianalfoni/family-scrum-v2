import { Storage } from "../../environment-interface/storage";

const shouldNotCallError = new Error("Should not be called on the server");

export const createStorage = (): Storage => {
  return {
    addGrocery() {
      throw shouldNotCallError;
    },
    addTodo() {
      throw shouldNotCallError;
    },
    archiveTodo() {
      throw shouldNotCallError;
    },
    deleteGrocery() {
      throw shouldNotCallError;
    },
    fetchFamilyData() {
      throw shouldNotCallError;
    },
    fetchWeeks() {
      throw shouldNotCallError;
    },
    increaseGroceryShopCount() {
      throw shouldNotCallError;
    },
    resetGroceryShopCount() {
      throw shouldNotCallError;
    },
    setWeekTaskActivity() {
      throw shouldNotCallError;
    },
    linkBarcode() {
      throw shouldNotCallError;
    },
    unlinkBarcode() {
      throw shouldNotCallError;
    },
    shopGrocery() {
      throw shouldNotCallError;
    },
    addImageToGrocery() {
      throw shouldNotCallError;
    },
    addChecklistItem() {
      throw shouldNotCallError;
    },
    deleteChecklistItem() {
      throw shouldNotCallError;
    },
    toggleCheckListItem() {
      throw shouldNotCallError;
    },
  };
};