import { Storage } from "../../environment-interface/storage";

const shouldNotCallError = new Error("Should not be called on the server");

export const createStorage = (): Storage => {
  return {
    createDinnerId() {
      throw shouldNotCallError;
    },
    createTodoId() {
      throw shouldNotCallError;
    },

    deleteDinner() {
      throw shouldNotCallError;
    },
    storeDinner() {
      throw shouldNotCallError;
    },
    addGrocery() {
      throw shouldNotCallError;
    },
    storeTodo() {
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

    setWeekTaskActivity() {
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
