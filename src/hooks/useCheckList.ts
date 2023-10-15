import { useCheckListItems } from "../stores/CheckListItemsStore";

export const useCheckList = (todoId: string) => {
  const checkListItems = useCheckListItems();
  const checkListItemsList = checkListItems.query.suspend();

  return checkListItemsList
    .filter((checkListItem) => checkListItem.todoId === todoId)
    .sort((a, b) => {
      if (a.created > b.created) {
        return 1;
      }
      if (a.created < b.created) {
        return -1;
      }

      return 0;
    });
};
