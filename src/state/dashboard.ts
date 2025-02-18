import { reactive } from "bonsify";
import { Context } from "../context";
import { FamilyScrumState } from "./familyScrum";

export type Dashboard = {};

export const createDashboard = (apis: Context, familyScrum: FamilyScrumState) =>
  reactive<Dashboard>({});
