import type { VercelRequest, VercelResponse } from "@vercel/node";
import packageJson from "../package.json";

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ version: packageJson.version });
}
