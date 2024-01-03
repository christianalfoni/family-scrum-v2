import {
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useGlobalContext } from "@/useGlobalContext";
import { ChatIcon } from "@heroicons/react/outline";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAssistantContext } from "./useAssistantContext";

export function Assistant() {
  const [message, setMessage] = useState("");
  const assistant = useAssistantContext();
  const t = useTranslations("Assistant");

  function sendMessage() {
    setMessage("");
    assistant.send(message);
  }

  useEffect(() => console.log(assistant.state), [assistant.state]);

  return (
    <div className="px-4 w-full">
      <DrawerHeader>
        <DrawerTitle>Ask the assistant</DrawerTitle>
      </DrawerHeader>

      <div className="flex flex-col">
        <ul className="pb-2">
          {assistant.messages.map((message, index) => (
            <li key={index}>
              <b>{message.role}:</b> {message.text}
            </li>
          ))}
        </ul>
        <textarea
          rows={3}
          disabled={assistant.state.status !== "THREAD_CREATED"}
          onChange={(event) => setMessage(event.target.value)}
          className="p-2 border-none block w-full focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder="Description..."
          value={message}
        />
      </div>
      <DrawerFooter>
        <button
          type="submit"
          disabled={assistant.state.status !== "THREAD_CREATED"}
          className="disabled:opacity-50 mx-autoinline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          onClick={sendMessage}
        >
          {t("send")}
        </button>
      </DrawerFooter>
    </div>
  );
}
