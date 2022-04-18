import { Storage } from "../../environment-interface/storage";

const shouldNotCallError = () => {
  throw new Error("Should not be called on the server");
};

export const createStorage = (): Storage => {
  return {
    createDinnerId: shouldNotCallError,
    createTodoId: shouldNotCallError,
    configureFamilyCollection: shouldNotCallError,
    deleteDinner: shouldNotCallError,
    storeDinner: shouldNotCallError,
    storeGrocery: shouldNotCallError,
    storeTodo: shouldNotCallError,
    archiveTodo: shouldNotCallError,
    deleteGrocery: shouldNotCallError,
    fetchFamilyData: shouldNotCallError,
    fetchWeeks: shouldNotCallError,
    setWeekTaskActivity: shouldNotCallError,
    addChecklistItem: shouldNotCallError,
    deleteChecklistItem: shouldNotCallError,
    toggleCheckListItem: shouldNotCallError,
    createCheckListItemId: shouldNotCallError,
    createGroceryId: shouldNotCallError,
    fetchImage: shouldNotCallError,
    getDinnerImageRef: shouldNotCallError,
    setWeekDinner: shouldNotCallError,
  };
};
