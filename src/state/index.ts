import { reactive } from "bonsify";
import { Context } from "../context";
import { createSession } from "./session";

export const createApp = (context: Context) =>
  reactive({ session: createSession(context) });
