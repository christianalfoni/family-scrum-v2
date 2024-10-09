import { DrawerFooter } from "@/components/ui/drawer";
import { useTranslations } from "next-intl";
import { ReactNode, useEffect, useState } from "react";
import { useAssistantContext } from "./useAssistantContext";
import { MessageCircleWarningIcon } from "lucide-react";
import { useAppContext } from "@/App/useAppContext";

const ASSISTANT_AVATAR_URL = "/chat_avatar.png";

function Message({
  avatarUrl,
  children,
}: {
  avatarUrl: string;
  children: ReactNode;
}) {
  return (
    <li className="p-4 max-w-sm w-full mx-auto">
      <div className="flex space-x-4">
        <div
          className="rounded-full bg-slate-200 h-10 w-10"
          style={{
            background: `url(${avatarUrl})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
          }}
        />
        <div className="flex-1 space-y-6 py-1">{children}</div>
      </div>
    </li>
  );
}

function LoadingAssistantMessage() {
  return (
    <li className="p-4 max-w-sm w-full mx-auto">
      <div className="animate-pulse flex space-x-4">
        <div
          className="rounded-full bg-slate-200 h-10 w-10"
          style={{
            background: `url(${ASSISTANT_AVATAR_URL})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
          }}
        />
        <div className="flex-1 space-y-6 py-1">
          <div className="h-2 bg-slate-200 rounded"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-2 bg-slate-200 rounded col-span-2"></div>
              <div className="h-2 bg-slate-200 rounded col-span-1"></div>
            </div>
            <div className="h-2 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </li>
  );
}

export function Assistant() {
  const { user, family } = useAppContext();
  const [message, setMessage] = useState("");
  const assistant = useAssistantContext();
  const t = useTranslations("Assistant");

  function sendMessage() {
    setMessage("");
    assistant.send(message);
  }

  useEffect(() => console.log(assistant.state), [assistant.state]);

  const isResponding =
    assistant.state.status === "REQUESTING_RUN" ||
    assistant.state.status === "RUNNING" ||
    assistant.state.status === "REQUIRES_ACTION" ||
    assistant.state.status === "SUBMITTING_TOOL_OUTPUT";

  const canWriteMessage =
    !isResponding && assistant.state.status !== "CREATING_THREAD";

  return (
    <div className="px-4 w-full">
      <div className="flex flex-col">
        <ul className="pb-2">
          <Message avatarUrl={ASSISTANT_AVATAR_URL}>{t("howCanIHelp")}</Message>
          {assistant.messages.map((message, index) => (
            <Message
              avatarUrl={
                message.role === "assistant"
                  ? ASSISTANT_AVATAR_URL
                  : family.users[user.id].avatar
              }
              key={index}
            >
              {message.text}
            </Message>
          ))}
          {isResponding ? <LoadingAssistantMessage /> : null}
          {assistant.state.status === "ERROR" ? (
            <li className="p-4 max-w-sm w-full mx-auto">
              <div className="flex space-x-4 text-red-500">
                <div className="h-10 w-10 flex items-center justify-center">
                  <MessageCircleWarningIcon />
                </div>
                <div className="flex-1 space-y-6 py-1">
                  {assistant.state.error}
                </div>
              </div>
            </li>
          ) : null}
        </ul>
        <textarea
          rows={3}
          disabled={!canWriteMessage}
          onChange={(event) => setMessage(event.target.value)}
          className="p-2 border-none block w-full focus:ring-blue-500 focus:border-blue-500 text-sm"
          placeholder={String(t("typeMessage"))}
          value={message}
        />
      </div>
      <DrawerFooter>
        <button
          type="submit"
          disabled={!canWriteMessage}
          className="disabled:opacity-50 mx-autoinline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          onClick={sendMessage}
        >
          {t("send")}
        </button>
      </DrawerFooter>
    </div>
  );
}
