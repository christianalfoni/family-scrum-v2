import { User } from "firebase/auth";
import { signal } from "impact-react";
import type { FamilyDTO, UserDTO, Firebase } from "./firebase";

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

export function createAuthentication(firebase: Firebase) {
  // It takes quite a long time for Firebase to evalaute the curent session, we
  // use a cached user and family to get rolling faster
  const cachedAuthentication: AuthenticatedSessionState | null = JSON.parse(
    localStorage.getItem(AUTHENTICATION_CACHE_KEY) || "null"
  );
  const state = signal<SessionState>(
    cachedAuthentication || {
      status: "AUTHENTICATING",
    }
  );

  firebase.onAuthChanged(handleAuthStateChanged);

  return {
    get state() {
      return state();
    },
  };

  // As part of being authenticated we also want to grab information
  // about the users family reference and the family itself
  async function handleAuthStateChanged(maybeUser: User | null) {
    const usersCollection = firebase.collections.users();
    const familiesCollection = firebase.collections.families();

    if (maybeUser) {
      try {
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
        state({
          status: "AUTHENTICATED",
          user,
          family,
        });

        localStorage.setItem(AUTHENTICATION_CACHE_KEY, JSON.stringify(state()));
      } catch (e) {
        state({
          status: "UNAUTHENTICATED",
          reason: String(e),
        });
      }
    } else {
      state({
        status: "UNAUTHENTICATED",
      });
    }
  }
}
