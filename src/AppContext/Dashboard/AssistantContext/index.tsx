import { Assistant } from "./Assistant";
import { useAssistantContext } from "./useAssistantContext";

export function AssistantContext() {
  return (
    <useAssistantContext.Provider>
      <Assistant />
    </useAssistantContext.Provider>
  );
}
