import { useAppContext } from "@/AppContext/useAppContext";
import type {
  Action,
  RetrieveThreadResponse,
} from "@/pages/api/retrieve_thread";
import { useGlobalContext } from "@/useGlobalContext";
import { GroceryDTO } from "@/useGlobalContext/firebase";
import { Timestamp } from "firebase/firestore";
import { context, effect, signal } from "impact-app";
import type {
  ThreadMessage,
  ThreadMessagesPage,
} from "openai/resources/beta/threads/messages/messages";
import type { Run } from "openai/resources/beta/threads/runs/runs";
import type { Thread } from "openai/resources/beta/threads/threads";

export type AssistantState =
  | {
      status: "CREATING_THREAD";
    }
  | {
      status: "THREAD_CREATED";
      threadId: string;
    }
  | {
      status: "REQUESTING_RUN";
      threadId: string;
    }
  | {
      status: "RUNNING";
      threadId: string;
      runId: string;
    }
  | {
      status: "REQUIRES_ACTION";
      threadId: string;
      runId: string;
      functionId: string;
      action: Action;
    }
  | {
      status: "SUBMITTING_TOOL_OUTPUT";
      threadId: string;
      runId: string;
    }
  | {
      status: "COMPLETED";
      messages: ThreadMessagesPage;
    }
  | {
      status: "ERROR";
      error: string;
    };

export const useAssistantContext = context(() => {
  const { firebase } = useGlobalContext();
  const { user } = useAppContext();

  const groceriesCollection = firebase.collections.groceries(user.familyId);

  const state = signal<AssistantState>({
    status: "CREATING_THREAD",
  });
  const messages = signal<Array<{ text: string; role: string }>>([]);

  createThread()
    .then((thread) => {
      state.value = {
        status: "THREAD_CREATED",
        threadId: thread.id,
      };
    })
    .catch((error) => {
      state.value = {
        status: "ERROR",
        error: String(error),
      };
    });

  let pollDisposer: (() => void) | undefined;

  effect(() => {
    if (state.value.status === "RUNNING") {
      const { threadId, runId } = state.value;

      pollDisposer = createPoller(() => {
        return retrieveThread(threadId, runId)
          .then((thread) => {
            if (thread.status === "completed") {
              state.value = {
                status: "COMPLETED",
                messages: thread.messages,
              };
              messages.value = [
                ...messages.value,
                ...getCompletedMessages(thread.messages.data[0]),
              ];
            } else if (
              thread.status === "requires_action" &&
              thread.action.type === "add_groceries"
            ) {
              state.value = {
                status: "SUBMITTING_TOOL_OUTPUT",
                threadId,
                runId,
              };
              console.log("WTF", thread.action);
              Promise.all(
                thread.action.groceries.map((name) => {
                  const grocery: GroceryDTO = {
                    id: firebase.createId(groceriesCollection),
                    name,
                    created: Timestamp.fromDate(new Date()),
                    modified: Timestamp.fromDate(new Date()),
                  };

                  return firebase.setDoc(groceriesCollection, {
                    ...grocery,
                    created: firebase.createServerTimestamp(),
                    modified: firebase.createServerTimestamp(),
                  });
                }),
              )
                .then(() =>
                  submitToolOutput(threadId, runId, thread.functionId, {
                    type: "success",
                  }),
                )
                .then(() => {
                  state.value = {
                    status: "RUNNING",
                    threadId,
                    runId,
                  };
                })
                .catch((error) => {
                  state.value = {
                    status: "ERROR",
                    error: String(error),
                  };
                });
            }
          })
          .catch((error) => {
            state.value = {
              status: "ERROR",
              error: String(error),
            };
          });
      });
    } else {
      pollDisposer?.();
    }
  });

  return {
    get state() {
      return state.value;
    },
    get messages() {
      return messages.value;
    },
    send(message: string) {
      if (state.value.status === "THREAD_CREATED") {
        const { threadId } = state.value;

        state.value = {
          status: "REQUESTING_RUN",
          threadId,
        };
        messages.value = [...messages.value, { role: "You", text: message }];

        runThread(threadId, message)
          .then((run) => {
            state.value = {
              status: "RUNNING",
              runId: run.id,
              threadId,
            };
          })
          .catch((error) => {
            state.value = {
              status: "ERROR",
              error: String(error),
            };
          });
      }
    },
    sendToolOutput(output: Record<string, string>) {
      if (state.value.status === "REQUIRES_ACTION") {
        const { threadId, runId, functionId } = state.value;

        submitToolOutput(threadId, runId, functionId, output)
          .then((run) => {
            state.value = {
              status: "RUNNING",
              runId: run.id,
              threadId,
            };
          })
          .catch((error) => {
            state.value = {
              status: "ERROR",
              error: String(error),
            };
          });
      }
    },
  };
});

function createThread(): Promise<Thread> {
  return fetch("/api/create_thread", {
    method: "POST",
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }

    return Promise.reject(response.text());
  });
}

function runThread(threadId: string, content: string): Promise<Run> {
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

function retrieveThread(
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

function submitToolOutput(
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

function createPoller(poll: () => Promise<any>) {
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

function getCompletedMessages(message: ThreadMessage) {
  return message.content.map((content) => {
    if (content.type === "image_file") {
      return { text: "N/A (Image file)", role: "Assistant" };
    }

    return { text: content.text.value, role: "Assistant" };
  });
}
