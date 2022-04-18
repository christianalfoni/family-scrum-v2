import { Authentication } from "../../environment-interface/authentication";

export const createAuthentication = (): Authentication => {
  return {
    signIn() {
      throw new Error("Should not be called on server");
    },
  };
};
