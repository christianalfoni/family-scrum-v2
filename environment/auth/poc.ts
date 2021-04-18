import { result } from "react-states";
import { Auth } from ".";

export const createAuth = (): Auth => {
  const user = {
    id: "123",
    name: "Christian Alfoni",
  };

  return {
    authenticate: () =>
      result(async (ok) => {
        return ok(user);
      }),
    signIn: () =>
      result(async (ok) => {
        return ok(user);
      }),
  };
};
