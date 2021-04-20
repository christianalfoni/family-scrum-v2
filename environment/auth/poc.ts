import { result } from "react-states";
import { Auth } from ".";

export const createAuth = (): Auth => {
  const user = {
    id: "123",
    name: "Bob Saget",
    familyId: "456",
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
