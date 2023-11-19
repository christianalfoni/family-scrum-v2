import { PlusIcon } from "@heroicons/react/outline";
import { useTranslations } from "next-intl";
import { useState } from "react";

export function AddCheckListItem({
  onAdd,
}: {
  onAdd: (title: string) => void;
}) {
  const t = useTranslations("CheckListsView");
  const [title, setTitle] = useState("");

  return (
    <div className="flex mt-2">
      <div className="flex-grow">
        <input
          autoFocus
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="block w-full shadow-sm focus:ring-light-blue-500 focus:border-light-blue-500 sm:text-sm border-gray-300 rounded-md"
          placeholder={`${t("title")}...`}
          aria-describedby="add_team_members_helper"
        />
      </div>
      <span className="ml-3">
        <button
          type="button"
          className="bg-white inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue-500"
          onClick={() => {
            onAdd(title);
            setTitle("");
          }}
        >
          <PlusIcon
            className="-ml-2 mr-1 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
          <span>{t("add")}</span>
        </button>
      </span>
    </div>
  );
}
