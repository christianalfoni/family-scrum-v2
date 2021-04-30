import { result } from "react-states";
import { Auth } from ".";
import { randomWait } from "../utils";

export const createAuth = (): Auth => {
  const user = {
    id: "123",
    name: "Bob Saget",
    familyId: "456",
  };

  return {
    authenticate: () =>
      result(async (_, err) => {
        await randomWait();
        return err("NOT_AUTHENTICATED");
      }),
    signIn: () =>
      result(async (ok) => {
        await randomWait();
        return ok(user);
      }),
  };
};
