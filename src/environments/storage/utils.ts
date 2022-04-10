import { CheckListItemDTO } from ".";

export const createCheckListItemsByTodoId = (checkListItems: {
  [itemId: string]: CheckListItemDTO;
}) =>
  Object.values(checkListItems).reduce<{
    [todoId: string]: {
      [itemId: string]: CheckListItemDTO;
    };
  }>((aggr, checkListItem) => {
    if (!aggr[checkListItem.todoId]) {
      aggr[checkListItem.todoId] = {};
    }

    aggr[checkListItem.todoId][checkListItem.id] = checkListItem;

    return aggr;
  }, {});
