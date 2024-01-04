import { NextApiRequest, NextApiResponse } from "next";
import { ASSISTANT_ID, openai } from "./_openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { threadId, content } = req.body;

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content,
  });

  const run = await openai.beta.threads.runs.create(threadId, {
    assistant_id: ASSISTANT_ID,
  });

  res.status(200).json(run);
}
