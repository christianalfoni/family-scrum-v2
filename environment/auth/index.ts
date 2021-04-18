import { Result } from "react-states";

export type AuthError = {
  type: "ERROR";
};

export type User = {
  id: string;
  name: string;
};

export interface Auth {
  signIn(): Result<User, AuthError>;
  authenticate(): Result<User | null, AuthError>;
}
