import { signal } from "impact-react";
import { detectNewVersion } from "./version";
import { createFirebase, FamilyDTO, UserDTO } from "./firebase";
import { createDinners, Dinners } from "./dinners";
import { User } from "firebase/auth";
import { AppState, AuthenticatedState, FirebaseSession } from "./app.types";

const FIREBASE_SESSION_CACHE_KEY = "family_scrum_authentication";

export function createApp() {
  const firebase = createFirebase();
  const hasNewVersion = signal(detectNewVersion());
  const state = signal(getInitialState());

  firebase.onAuthChanged(handleAuthStateChanged);

  return {
    get state() {
      return state();
    },
    get hasNewVersion() {
      return hasNewVersion();
    },
  };

  function getInitialState(): AppState {
    // It takes quite a long time for Firebase to evalaute the curent session, we
    // use a cached user and family to get rolling faster
    const cachedSession: FirebaseSession | null = JSON.parse(
      localStorage.getItem(FIREBASE_SESSION_CACHE_KEY) || "null"
    );

    return cachedSession
      ? createAuthenticatedState(cachedSession)
      : {
          status: "AUTHENTICATING",
        };
  }

  function createAuthenticatedState(
    session: FirebaseSession
  ): AuthenticatedState {
    return {
      status: "AUTHENTICATED",
      ...session,
      dinners: createDinners(firebase),
    };
  }

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
        state(
          createAuthenticatedState({
            user,
            family,
          })
        );

        localStorage.setItem(
          FIREBASE_SESSION_CACHE_KEY,
          JSON.stringify(state())
        );
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
