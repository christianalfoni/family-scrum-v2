// functions/src/index.ts
import { onCall, HttpsError } from "firebase-functions/v2/https";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

// —– 2) Zod schema for the request —–
const requestSchema = z.object({
  groceries: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
});

const responseSchema = z.object({
  sortedGroceriesByCategory: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.enum([
        "produce",
        "dairy",
        "meat and fish",
        "bakery",
        "frozen",
        "packaged and processed",
        "beverages",
        "household and non food items",
        "candy",
      ]),
    })
  ),
});

// —– 4) The callable function —–
export const categorizeGroceries = onCall(async (req) => {
  // —– your OpenAI key should be stored as a Functions secret —–
  // in firebase.json under "functions": { "secrets": ["OPENAI_API_KEY"] }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Auth check (optional—remove if public)
  const uid = req.auth?.uid;

  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "Must be signed in to categorize groceries"
    );
  }

  // Validate incoming data
  const { groceries } = requestSchema.parse(req.data);

  // Build a prompt that instructs the model to pick exactly one of our enum values
  const systemPrompt =
    `You are a grocery categorization assistant. Given a list of groceries you will categorize groceries. It is important that the result includes all groceries prompted by the user.`.trim();

  // Call OpenAI
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(groceries) },
    ],
    response_format: zodResponseFormat(responseSchema, "groceriesByCategory"),
  });

  const reply = completion.choices[0].message.parsed;

  if (!reply) {
    throw new HttpsError("internal", "No response from OpenAI");
  }

  return reply.sortedGroceriesByCategory;
});
