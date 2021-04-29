import { Result } from "react-states";

export type AuthError =
  | {
      type: "ERROR";
      data: string;
    }
  | { type: "NOT_AUTHENTICATED" };

export type UserDTO = {
  id: string;
  name: string;
  familyId: string;
};

export interface Auth {
  signIn(): Result<UserDTO, AuthError>;
  authenticate(): Result<UserDTO, AuthError>;
}
