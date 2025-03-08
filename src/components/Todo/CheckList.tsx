import React from "react";
import { AddCheckListItem } from "./AddCheckListItem";
import { TrashIcon } from "@heroicons/react/24/solid";
import * as state from "../../state";

type CheckListItemProps = {
  item: state.CheckListItem;
  index: number;
};

function CheckListItem({ item, index }: CheckListItemProps) {
  return (
    <li className="flex items-center text-lg py-1 px-1">
      <input
        id={"checkListItem-" + index}
        type="checkbox"
        className="rounded text-green-500 mr-2"
        checked={item.completed}
        onChange={item.toggle}
      />
      <label htmlFor={"checkListItem-" + index} className="w-full">
        {item.title}
      </label>
      <span className="p-2 text-gray-300" onClick={item.remove}>
        <TrashIcon className="w-6 h-6" />
      </span>
    </li>
  );
}

type Props = {
  todo: state.Todo;
};

export function CheckList({ todo }: Props) {
  const [addingCheckListItem, setAddingCheckListItem] = React.useState(false);

  return (
    <ul className="mt-2">
      {todo.checkList.map((item, index) => (
        <CheckListItem key={item.title} item={item} index={index} />
      ))}
      <li>
        {addingCheckListItem ? (
          <AddCheckListItem onAdd={(title) => todo.addCheckListItem(title)} />
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
