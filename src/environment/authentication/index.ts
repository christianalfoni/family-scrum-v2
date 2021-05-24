import { Events } from "react-states";

export type UserDTO = {
  id: string;
  name: string;
  familyId: string;
};

export type AuthenticationEvent =
  | {
      type: "AUTHENTICATION:AUTHENTICATED";
      user: UserDTO;
    }
  | {
      type: "AUTHENTICATION:UNAUTHENTICATED";
    }
  | {
      type: "AUTHENTICATION:SIGN_IN_ERROR";
      error: string;
    };

export interface Authentication {
  events: Events<AuthenticationEvent>;
  signIn(): void;
}