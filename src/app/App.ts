import { User } from "firebase/auth";
import { signal } from "impact-react";
import { createFamilyScrum, FamilyScrum } from "./familyScrum/familyScrum";
import { createFirebase, FamilyDTO, UserDTO } from "./firebase";
import { detectNewVersion } from "./version";
import { AuthenticatedSessionState, SessionState } from "./app.types";

const AUTHENTICATION_CACHE_KEY = "family_scrum_authentication";

export function createApp() {
  const firebase = createFirebase();
  const hasNewVersion = signal(detectNewVersion());
  const session = signal(getInitialSessionState());

  firebase.onAuthChanged(handleAuthStateChanged);

  return {
    get session() {
      return session();
    },
    get hasNewVersion() {
      return hasNewVersion();
    },
  };

  function getInitialSessionState(): SessionState {
    // It takes quite a long time for Firebase to evalaute the curent session, we
    // use a cached user and family to get rolling faster
    const cachedAuthentication: { user: UserDTO; family: FamilyDTO } | null =
      JSON.parse(localStorage.getItem(AUTHENTICATION_CACHE_KEY) || "null");

    return cachedAuthentication
      ? createAuthenticatedState(
          cachedAuthentication.user,
          cachedAuthentication.family
        )
      : {
          status: "AUTHENTICATING",
        };
  }

  function createAuthenticatedState(
    user: UserDTO,
    family: FamilyDTO
  ): AuthenticatedSessionState {
    return {
      status: "AUTHENTICATED",
      user,
      family,
      familyScrum: createFamilyScrum(firebase, user, family),
    };
  }

  // As part of being authenticated we also want to grab information
  // about the users family reference and the family itself
  async function handleAuthStateChanged(maybeUser: User | null) {
    const usersCollection = firebase.collections.users();
    const familiesCollection = firebase.collections.families();
    const currentSession = session();

    // We do not update the session when already authenticated
    if (currentSession.status === "AUTHENTICATED" && maybeUser) {
      return;
    }

    // We dispose of the family scrum instance when logged out
    if (currentSession.status === "AUTHENTICATED") {
      currentSession.familyScrum.dispose();
    }

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
        session(createAuthenticatedState(user, family));

        localStorage.setItem(
          AUTHENTICATION_CACHE_KEY,
          JSON.stringify({
            user,
            family,
          })
        );
      } catch (e) {
        session({
          status: "UNAUTHENTICATED",
          reason: String(e),
        });
      }
    } else {
      session({
        status: "UNAUTHENTICATED",
      });
    }
  }
}
