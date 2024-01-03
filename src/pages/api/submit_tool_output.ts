import { NextApiRequest, NextApiResponse } from "next";
import { openai } from "./_openai";

export type SubmitToolOutputPayload = {
  threadId: string;
  runId: string;
  toolCallId: string;
  output: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { threadId, runId, toolCallId, output } =
    req.body as SubmitToolOutputPayload;

  const result = await openai.beta.threads.runs.submitToolOutputs(
    threadId,
    runId,
    {
      tool_outputs: [
        {
          tool_call_id: toolCallId,
          output: JSON.stringify(output),
        },
      ],
    },
  );

  res.status(200).json(result);
}
