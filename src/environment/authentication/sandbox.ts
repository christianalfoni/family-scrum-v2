import { events } from "react-states";
import { Authentication, AuthenticationEvent } from ".";
import { randomWait } from "../utils";

export const createAuthentication = (): Authentication => {
  const authenticationEvents = events<AuthenticationEvent>();
  const user = {
    id: "user_1",
    name: "Bob Saget",
    familyId: "456",
  };

  setTimeout(() => {
    authenticationEvents.emit({
      type: "AUTHENTICATION:UNAUTHENTICATED",
    });
  }, 100);

  return {
    events: authenticationEvents,
    async signIn() {
      await randomWait();
      authenticationEvents.emit({
        type: "AUTHENTICATION:AUTHENTICATED",
        user,
      });
    },
  };
};
