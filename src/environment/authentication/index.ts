import { Events } from "react-states";

export type FamilyUserDTO = {
  id: string;
  familyId: string;
};

export type UserDTO = {
  id: string;
};

export type AuthenticationEvent =
  | {
      type: "AUTHENTICATION:AUTHENTICATED";
      user: UserDTO;
    }
  | {
      type: "AUTHENTICATION:AUTHENTICATED_WITH_FAMILY";
      user: FamilyUserDTO;
    }
  | {
      type: "AUTHENTICATION:UNAUTHENTICATED";
    }
  | {
      type: "AUTHENTICATION:ERROR";
      error: string;
    }
  | {
      type: "AUTHENTICATION:SIGN_IN_ERROR";
      error: string;
    };

export interface Authentication {
  /**
   * @fires AUTHENTICATION:AUTHENTICATED
   * @fires AUTHENTICATION:AUTHENTICATED_WITH_FAMILY
   * @fires AUTHENTICATION:UNAUTHENTICATED
   * @fires AUTHENTICATION:ERROR
   */
  events: Events<AuthenticationEvent>;
  /**
   * @fires AUTHENTICATION:SIGN_IN_ERROR
   */
  signIn(): void;
}
