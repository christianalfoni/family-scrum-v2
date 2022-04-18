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
  signIn(): void;
}
