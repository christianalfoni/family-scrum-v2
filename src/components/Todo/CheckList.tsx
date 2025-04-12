import React from "react";
import { AddCheckListItem } from "./AddCheckListItem";
import { TrashIcon } from "@heroicons/react/24/solid";
import { CheckListItemDTO, TodoDTO } from "../../environment/Persistence";
import { useFamilyScrum } from "../FamilyScrumContext";

type CheckListItemProps = {
  item: CheckListItemDTO;
  index: number;
  disabled: boolean;
  onToggle: () => void;
  onRemove: () => void;
};

function CheckListItem({
  item,
  index,
  disabled,
  onToggle,
  onRemove,
}: CheckListItemProps) {
  return (
    <li className="flex items-center text-lg py-1 px-1">
      <input
        id={"checkListItem-" + index}
        type="checkbox"
        disabled={disabled}
        className={`rounded text-green-500 mr-2${
          disabled ? " opacity-50" : ""
        }`}
        checked={item.completed}
        onChange={onToggle}
      />
      <label htmlFor={"checkListItem-" + index} className="w-full">
        {item.title}
      </label>
      <span className="p-2 text-gray-300" onClick={onRemove}>
        <TrashIcon className="w-6 h-6" />
      </span>
    </li>
  );
}

type Props = {
  todo: TodoDTO;
};

export function CheckList({ todo }: Props) {
  const familyScrum = useFamilyScrum();
  const { todos } = familyScrum;
  const {
    addCheckListItemMutation,
    toggleCheckListItemMutation,
    removeCheckListItemMutation,
  } = todos;
  const [addingCheckListItem, setAddingCheckListItem] = React.useState(false);
  const checkList = todo.checkList || [];

  return (
    <ul className="mt-2">
      {checkList.map((item, index) => (
        <CheckListItem
          key={item.title}
          item={item}
          index={index}
          disabled={
            toggleCheckListItemMutation.isPending ||
            removeCheckListItemMutation.isPending
          }
          onToggle={() => toggleCheckListItemMutation.mutate(todo.id, index)}
          onRemove={() => removeCheckListItemMutation.mutate(todo.id, index)}
        />
      ))}
      <li>
        {addingCheckListItem ? (
          <AddCheckListItem
            onAdd={(title) => {
              addCheckListItemMutation.mutate(todo.id, title);
              setAddingCheckListItem(false);
            }}
          />
        ) : (
          <div
            className="p-2 text-gray-400 text-center text-lg"
            onClick={() => setAddingCheckListItem(true)}
          >
            Add Item
          </div>
        )}
      </li>
    </ul>
  );
}
