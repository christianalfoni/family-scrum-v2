import { User } from "firebase/auth";
import { signal, cleanup } from "impact-app";
import type { FamilyDTO, UserDTO, useFirebase } from "./firebase";

type AuthenticatedSessionState = {
  status: "AUTHENTICATED";
  user: UserDTO;
  family: FamilyDTO;
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

const AUTHENTICATION_CACHE_KEY = "family_scrum_authentication";

export function useAuthentication(firebase: ReturnType<typeof useFirebase>) {
  const usersCollection = firebase.collections.users();
  const familiesCollection = firebase.collections.families();
  const cachedAuthentication: AuthenticatedSessionState | null = JSON.parse(
    localStorage.getItem(AUTHENTICATION_CACHE_KEY) || "null",
  );
  const state = signal<SessionState>(
    cachedAuthentication || {
      status: "AUTHENTICATING",
    },
  );

  cleanup(firebase.onAuthChanged(handleAuthStateChanged));

  async function handleAuthStateChanged(maybeUser: User | null) {
    if (maybeUser) {
      try {
        const lastStatus = state.value.status;

        const user = await firebase.getDoc(usersCollection, maybeUser.uid);

        if (!user) {
          throw new Error("No user doc");
        }

        const family = await firebase.getDoc(familiesCollection, user.familyId);

        if (!family) {
          throw new Error("No family doc");
        }

        // We might be unauthenticated during fetching the user doc, use RXJS to see how that could be solved?
        if (state.value.status === lastStatus) {
          state.value = {
            status: "AUTHENTICATED",
            user,
            family,
          };
          localStorage.setItem(
            AUTHENTICATION_CACHE_KEY,
            JSON.stringify(state.value),
          );
        }
      } catch (e) {
        state.value = {
          status: "UNAUTHENTICATED",
          reason: String(e),
        };
      }
    } else {
      state.value = {
        status: "UNAUTHENTICATED",
      };
    }
  }

  return {
    get state() {
      return state.value;
    },
    signIn: firebase.signIn,
  };
}
