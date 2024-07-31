import { FamilyScrum } from "./familyScrum/familyScrum";
import { FamilyDTO, UserDTO } from "./firebase";

export type AuthenticatedSessionState = {
  status: "AUTHENTICATED";
  user: UserDTO;
  family: FamilyDTO;
  familyScrum: FamilyScrum;
};

export type SessionState =
  | {
      status: "AUTHENTICATING";
    }
  | AuthenticatedSessionState
  | {
      status: "UNAUTHENTICATED";
      reason?: string;
    };
