import { TEmit } from "react-environment-interface";
import {
  Authentication,
  AuthenticationEvent,
  FamilyUserDTO,
} from "../../environment-interface/authentication";

import { randomWait } from "../utils";

export const createAuthentication = (
  emit: TEmit<AuthenticationEvent>
): Authentication => {
  const user: FamilyUserDTO = {
    id: "user_1",
    familyId: "456",
  };

  setTimeout(() => {
    emit({
      type: "AUTHENTICATION:UNAUTHENTICATED",
    });
  }, 100);

  return {
    async signIn() {
      await randomWait();
      emit({
        type: "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY",
        user,
      });
    },
  };
};
