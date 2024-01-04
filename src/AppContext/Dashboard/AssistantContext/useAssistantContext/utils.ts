import type { RetrieveThreadResponse } from "@/pages/api/retrieve_thread";
import { Timestamp } from "firebase/firestore";
import type { ThreadMessage } from "openai/resources/beta/threads/messages/messages";
import type { Run } from "openai/resources/beta/threads/runs/runs";
import type { Thread } from "openai/resources/beta/threads/threads";

export function createThread(): Promise<Thread> {
  return fetch("/api/create_thread", {
    method: "POST",
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }

    return Promise.reject(response.text());
  });
}

export function runThread(threadId: string, content: string): Promise<Run> {
  return fetch("/api/run_thread", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      threadId,
      content,
    }),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }

    return Promise.reject(response.text());
  });
}

export function retrieveThread(
  threadId: string,
  runId: string,
): Promise<RetrieveThreadResponse> {
  return fetch(`/api/retrieve_thread?threadId=${threadId}&runId=${runId}`).then(
    (response) => {
      if (response.ok) {
        return response.json();
      }

      return Promise.reject(response.text());
    },
  );
}

export function submitToolOutput(
  threadId: string,
  runId: string,
  toolCallId: string,
  output: Record<string, string>,
): Promise<Run> {
  return fetch(`/api/submit_tool_output`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      threadId,
      runId,
      toolCallId,
      output,
    }),
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }

    return Promise.reject(response.text());
  });
}

export function poll(poll: () => Promise<any>) {
  let timeout: number | undefined;
  let abortController: AbortController | undefined;

  const runPoller = () => {
    abortController = new AbortController();
    poll().finally(() => {
      if (abortController?.signal.aborted) {
        return;
      }

      timeout = setTimeout(runPoller, 500) as unknown as number;
    });
  };

  runPoller();

  return () => {
    abortController?.abort();
    clearTimeout(timeout);
  };
}

export function getCompletedMessages(message: ThreadMessage) {
  return message.content.map((content) => {
    if (content.type === "image_file") {
      return { text: "N/A (Image file)", role: "assistant" as const };
    }

    return { text: content.text.value, role: "assistant" as const };
  });
}

// The format is "2024-01-01", but the year can be wrong, so
// we need to manually handle that
export function createDateFromAssistant(assistantDate: string) {
  const [_, month, day] = assistantDate.split("-").map(Number);

  const date = new Date();

  date.setMonth(month - 1);
  date.setDate(day);

  if (Date.now() > date.getTime()) {
    date.setFullYear(date.getFullYear() + 1);
  }

  return Timestamp.fromDate(date);
}
