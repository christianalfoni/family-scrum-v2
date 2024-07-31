import { use } from "impact-react";
import { createApp } from "./app";

const app = createApp();

export const useApp = () => app;

export const useFamilyScrum = () => {
  const app = useApp();

  if (app.session.status !== "AUTHENTICATED") {
    throw new Error("Wrong usage");
  }

  return app.session.familyScrum;
};

export const useDinners = () => {
  const familyScrum = useFamilyScrum();

  return use(familyScrum.dinners);
};

export const useGroceries = () => {
  const familyScrum = useFamilyScrum();

  return use(familyScrum.groceries);
};

export const useTodos = () => {
  const familyScrum = useFamilyScrum();

  return use(familyScrum.todos);
};
