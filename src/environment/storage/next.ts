import { events } from "react-states";
import { Storage } from ".";

const shouldNotCallError = new Error("Should not be called on the server");

export const createStorage = (): Storage => {
  return {
    events: events(),
    addEvent() {
      throw shouldNotCallError;
    },
    addGrocery() {
      throw shouldNotCallError;
    },
    addTodo() {
      throw shouldNotCallError;
    },
    archiveEvent() {
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
    toggleEventParticipation() {
      throw shouldNotCallError;
    },
  };
};
