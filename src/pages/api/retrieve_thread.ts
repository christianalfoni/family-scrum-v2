import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "./_openai";
import { ThreadMessagesPage } from "openai/resources/beta/threads/messages/messages";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";

export type Action =
  | {
      type: "add_groceries";
      groceries: string[];
    }
  | {
      type: "add_todo";
      todo: {
        description: string;
        time?: string;
        date?: string;
        checklist?: string[];
      };
    };

export type RetrieveThreadResponse =
  | {
      status: "completed";
      messages: ThreadMessagesPage;
    }
  | {
      status: "pending";
    }
  | {
      status: "requires_action";
      functionId: string;
      action: Action;
    };

function toolCallToAction(toolCall: RequiredActionFunctionToolCall): Action {
  console.log("WOOP", toolCall.function);
  switch (toolCall.function.name) {
    case "create_shopping_list":
      return {
        type: "add_groceries",
        groceries: JSON.parse(toolCall.function.arguments).groceries,
      };
    case "add_todo":
      console.log("HMMM", JSON.parse(toolCall.function.arguments));
      return {
        type: "add_todo",
        todo: JSON.parse(toolCall.function.arguments),
      };
  }

  throw new Error("Unknown function name");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { threadId, runId } = req.query as Record<string, string>;
  const result = await openai.beta.threads.runs.retrieve(threadId, runId);

  let response: RetrieveThreadResponse = {
    status: "pending",
  };

  if (result.status === "completed") {
    const messages = await openai.beta.threads.messages.list(threadId);

    response = {
      status: "completed",
      messages,
    };
  } else if (
    result.status === "requires_action" &&
    result.required_action?.type === "submit_tool_outputs"
  ) {
    const toolCall = result.required_action.submit_tool_outputs.tool_calls[0];

    response = {
      status: "requires_action",
      functionId: toolCall.id,
      action: toolCallToAction(toolCall),
    };
  }

  res.status(200).json(response);
}
