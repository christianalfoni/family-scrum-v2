import * as React from "react";
import {
  CalendarIcon,
  ChevronDownIcon,
  ClipboardDocumentCheckIcon,
  ArchiveBoxIcon,
  ChevronUpIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { Confirmed } from "./Confirmed";
import { getDayName } from "../../utils";
import { CheckList } from "./CheckList";
import { Link } from "react-router";
import { useFamilyScrum } from "../FamilyScrumContext";
import { TodoDTO } from "../../environment/Persistence";
import { Text } from "@/components/text";

type Props = {
  todo: TodoDTO;
  children?: React.ReactNode;
};

export function Todo({ todo, children }: Props) {
  const familyScrum = useFamilyScrum();
  const { todos } = familyScrum;
  const [isCollapsed, setCollapsed] = React.useState(true);
  const [archiving, setArchiving] = React.useState(false);

  React.useEffect(() => {
    if (archiving) {
      const id = setTimeout(
        () => todos.archiveTodoMutation.mutate(todo.id),
        1500
      );

      return () => clearTimeout(id);
    }
  }, [archiving]);

  return (
    <li key={todo.id} className="relative pl-4 pr-6 py-5 ">
      {archiving ? <Confirmed /> : null}
      {todo.date || todo.time ? (
        <div className="flex items-center text-gray-500">
          {todo.date ? (
            <Text className="flex items-center text-sm mr-3">
              <CalendarIcon className="w-4 h-4 mr-1" />
              {getDayName(todo.date)} - {todo.date.toLocaleDateString()}
            </Text>
          ) : null}
          {todo.time ? (
            <Text className="flex items-center text-sm mr-3">
              <ClockIcon className="w-4 h-4 mr-1 " />
              {todo.time}
            </Text>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-center">
        <Link to={`/todos/${todo.id}`}>
          <Text>{todo.description}</Text>
        </Link>
        <ArchiveBoxIcon
          className="absolute top-2 right-2 text-zinc-300 w-5 h-5"
          onClick={() => {
            setArchiving(true);
          }}
        />
      </div>

      <div className=" my-2 text-sm text-zinc-500 border border-zinc-700 p-2 rounded-md bg-zinc-800">
        <div
          className="flex items-center"
          onClick={() => setCollapsed((current) => !current)}
        >
          <ClipboardDocumentCheckIcon className="w-4 h-4 mr-1" />
          {todo.checkList?.filter((item) => item.completed).length ?? 0} /{" "}
          {todo.checkList?.length ?? 0}
          {isCollapsed ? (
            <ChevronUpIcon className="w-4 h-4 ml-auto" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 ml-auto" />
          )}
        </div>
        {isCollapsed ? null : <CheckList todo={todo} />}
      </div>

      {children}
    </li>
  );
}
