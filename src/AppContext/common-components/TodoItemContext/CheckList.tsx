import React from "react";
import type { CheckListItem } from "../../../useGlobalContext/firebase";
import { useTodoItemContext } from "./useTodoItemContext";
import { AddCheckListItem } from "./AddCheckListItem";
import { TrashIcon } from "@heroicons/react/outline";
import { useTranslations } from "next-intl";

function CheckListItem({
  item,
  index,
}: {
  item: CheckListItem;
  index: number;
}) {
  const { setCheckListItemCompleted, removeCheckListItem } =
    useTodoItemContext();

  return (
    <li className="flex items-center text-lg py-1 px-1">
      <input
        id={"checkListItem-" + index}
        type="checkbox"
        className="rounded text-green-500 mr-2"
        checked={item.completed}
        onChange={() => setCheckListItemCompleted(index, !item.completed)}
      />
      <label htmlFor={"checkListItem-" + index} className="w-full">
        {item.title}
      </label>
      <span
        className="p-2 text-gray-300"
        onClick={() => removeCheckListItem(index)}
      >
        <TrashIcon className="w-6 h-6" />
      </span>
    </li>
  );
}

export function CheckList({ checkList }: { checkList: CheckListItem[] }) {
  const { addCheckListItem, resetCheckList } = useTodoItemContext();

  const t = useTranslations("CheckListsView");

  const [addingCheckListItem, setAddingCheckListItem] = React.useState(false);

  return (
    <div>
      <ul className="mt-2">
        {checkList.map((item, index) => (
          <CheckListItem key={item.title} item={item} index={index} />
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        {addingCheckListItem ? (
          <div className="flex-grow">
            <AddCheckListItem
              onAdd={(title) => {
                addCheckListItem(title);
                setAddingCheckListItem(false);
              }}
            />
          </div>
        ) : (
          <button
            className="flex-grow p-2 text-gray-400 text-center text-lg border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => setAddingCheckListItem(true)}
          >
            {t("addNewItem")}
          </button>
        )}
        {!addingCheckListItem && (
          <button
            className="px-4 py-2 text-gray-400 text-lg border border-gray-300 rounded-md hover:bg-gray-50"
            onClick={() => resetCheckList()}
          >
            {t("reset")}
          </button>
        )}
      </div>
    </div>
  );
}
