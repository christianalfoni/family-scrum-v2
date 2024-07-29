import { Dinners } from "./dinners";
import { FamilyDTO, UserDTO } from "./firebase";

export type FirebaseSession = {
  user: UserDTO;
  family: FamilyDTO;
};

export type AuthenticatingState = {
  status: "AUTHENTICATING";
};

export type AuthenticatedState = FirebaseSession & {
  status: "AUTHENTICATED";
  dinners: Dinners;
};

export type UnauthenticatedState = {
  status: "UNAUTHENTICATED";
  reason?: string;
};

export type AppState =
  | AuthenticatingState
  | AuthenticatedState
  | UnauthenticatedState;
