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

  // It takes quite a long time for Firebase to evalaute the curent session, we
  // use a cached user and family to get rolling faster
  const cachedAuthentication: AuthenticatedSessionState | null = JSON.parse(
    localStorage.getItem(AUTHENTICATION_CACHE_KEY) || "null",
  );
  const state = signal<SessionState>(
    cachedAuthentication || {
      status: "AUTHENTICATING",
    },
  );

  cleanup(firebase.onAuthChanged(handleAuthStateChanged));

  // As part of being authenticated we also want to grab information
  // about the users family reference and the family itself
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

        // Theoretically we could already be unauthenticated by Firebase for whatever reason. Something
        // like RxJS would be interesting to explore here.
        state.value = {
          status: "AUTHENTICATED",
          user,
          family,
        };

        localStorage.setItem(
          AUTHENTICATION_CACHE_KEY,
          JSON.stringify(state.value),
        );
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
  };
}
