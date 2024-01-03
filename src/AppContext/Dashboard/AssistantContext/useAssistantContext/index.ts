import { useAppContext } from "@/AppContext/useAppContext";
import type {
  Action,
  RetrieveThreadResponse,
} from "@/pages/api/retrieve_thread";
import { useGlobalContext } from "@/useGlobalContext";
import { GroceryDTO } from "@/useGlobalContext/firebase";
import { Timestamp } from "firebase/firestore";
import { context, effect, signal } from "impact-app";
import type { ThreadMessagesPage } from "openai/resources/beta/threads/messages/messages";
import {
  createDateFromAssistant,
  createThread,
  getCompletedMessages,
  poll,
  retrieveThread,
  runThread,
  submitToolOutput,
} from "./utils";

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
  const todosCollection = firebase.collections.todos(user.familyId);

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

  const handleRequiresActionThread = async (
    threadId: string,
    runId: string,
    thread: RetrieveThreadResponse & { status: "requires_action" },
  ) => {
    if (thread.action.type === "add_groceries") {
      const addGroceryRequests = thread.action.groceries.map((name) => {
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
      });

      await Promise.all(addGroceryRequests);

      return;
    }

    if (thread.action.type === "add_todo") {
      await firebase.setDoc(todosCollection, {
        id: firebase.createId(todosCollection),
        description: thread.action.todo.description,
        checkList: thread.action.todo.checklist
          ? thread.action.todo.checklist.map((title) => ({
              completed: false as const,
              title,
            }))
          : undefined,
        date: thread.action.todo.date
          ? createDateFromAssistant(thread.action.todo.date)
          : undefined,
        time: thread.action.todo.time,
        created: firebase.createServerTimestamp(),
        modified: firebase.createServerTimestamp(),
      });

      return;
    }
  };

  let pollDisposer: (() => void) | undefined;

  effect(() => {
    if (state.value.status !== "RUNNING") {
      pollDisposer?.();
      return;
    }

    const { threadId, runId } = state.value;

    pollDisposer = poll(async () => {
      try {
        const thread = await retrieveThread(threadId, runId);

        if (thread.status === "completed") {
          state.value = {
            status: "COMPLETED",
            messages: thread.messages,
          };
          messages.value = [
            ...messages.value,
            ...getCompletedMessages(thread.messages.data[0]),
          ];

          return;
        }

        if (thread.status === "requires_action") {
          state.value = {
            status: "SUBMITTING_TOOL_OUTPUT",
            threadId,
            runId,
          };

          await handleRequiresActionThread(threadId, runId, thread);

          await submitToolOutput(threadId, runId, thread.functionId, {
            type: "success",
          });

          state.value = {
            status: "RUNNING",
            threadId,
            runId,
          };
        }
      } catch (error) {
        state.value = {
          status: "ERROR",
          error: String(error),
        };
      }
    });
  });

  return {
    get state() {
      return state.value;
    },
    get messages() {
      return messages.value;
    },
    async send(message: string) {
      if (state.value.status !== "THREAD_CREATED") {
        return;
      }

      const { threadId } = state.value;

      state.value = {
        status: "REQUESTING_RUN",
        threadId,
      };
      messages.value = [...messages.value, { role: "You", text: message }];

      try {
        const run = await runThread(threadId, message);
        state.value = {
          status: "RUNNING",
          runId: run.id,
          threadId,
        };
      } catch (error) {
        state.value = {
          status: "ERROR",
          error: String(error),
        };
      }
    },
    async sendToolOutput(output: Record<string, string>) {
      if (state.value.status !== "REQUIRES_ACTION") {
        return;
      }

      const { threadId, runId, functionId } = state.value;

      try {
        const run = await submitToolOutput(threadId, runId, functionId, output);

        state.value = {
          status: "RUNNING",
          runId: run.id,
          threadId,
        };
      } catch (error) {
        state.value = {
          status: "ERROR",
          error: String(error),
        };
      }
    },
  };
});
