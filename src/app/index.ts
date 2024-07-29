import { createApp } from "./app";

const app = createApp();

export const useApp = () => app;

export const useAuthenticatedApp = () => {
  if (app.state.status === "AUTHENTICATED") {
    return app.state;
  }

  throw new Error("You can not use the app in an unauthenticated state");
};
