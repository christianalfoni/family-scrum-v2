import { events } from "react-states";
import { Authentication } from ".";

export const createAuthentication = (): Authentication => {
  return {
    events: events(),
    signIn() {
      throw new Error("Should not be called on server");
    },
  };
};
