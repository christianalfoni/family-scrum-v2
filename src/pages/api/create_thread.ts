import { NextApiRequest, NextApiResponse } from "next";
import { ASSISTANT_ID, openai } from "./_openai";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const thread = await openai.beta.threads.create();

  res.status(200).json(thread);
}
