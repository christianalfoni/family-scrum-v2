import { User } from "firebase/auth";
import type { FamilyDTO, UserDTO } from "../apis/firebase";
import { reactive } from "bonsify";
import { createFamilyScrum, FamilyScrum } from "./familyScrum";
import { Apis } from "../apis";

type AUTHENTICATED = {
  current: "AUTHENTICATED";
  familyScrum: FamilyScrum;
};

type AUTHENTICATING = {
  current: "AUTHENTICATING";
};

type UNAUTHENTICATED = {
  current: "UNAUTHENTICATED";
  reason?: string;
  signIn(): void;
};

export type SessionState = AUTHENTICATED | AUTHENTICATING | UNAUTHENTICATED;

export type Session = {
  state: SessionState;
};

const AUTHENTICATION_CACHE_KEY = "family_scrum_authentication";

export function createSession(apis: Apis) {
  const { firebase } = apis;

  const UNAUTHENTICATED = (reason?: string): UNAUTHENTICATED => ({
    current: "UNAUTHENTICATED",
    reason,
    signIn() {
      firebase.signIn();
    },
  });
  const AUTHENTICATING = (): AUTHENTICATING => ({ current: "AUTHENTICATING" });
  const AUTHENTICATED = (user: UserDTO, family: FamilyDTO): AUTHENTICATED => ({
    current: "AUTHENTICATED",
    familyScrum: createFamilyScrum(apis, user, family),
  });

  const usersCollection = firebase.collections.users();
  const familiesCollection = firebase.collections.families();

  let currentUserUid: string | null = null;

  firebase.onAuthChanged(async (maybeUser: User | null) => {
    if (
      session.state.current === "AUTHENTICATED" &&
      maybeUser?.uid !== currentUserUid
    ) {
      session.state.familyScrum.dispose();
    }

    currentUserUid = maybeUser?.uid || null;

    if (maybeUser) {
      try {
        // As part of being authenticated we also want to grab information
        // about the users family reference and the family itself
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
        session.state = AUTHENTICATED(user, family);

        localStorage.setItem(
          AUTHENTICATION_CACHE_KEY,
          JSON.stringify({ user, family })
        );
      } catch (e) {
        session.state = UNAUTHENTICATED(String(e));
      }
    } else {
      session.state = UNAUTHENTICATED();
    }
  });

  // It takes quite a long time for Firebase to evalaute the curent session, we
  // use a cached user and family to get rolling faster
  const cachedAuthentication: { user: UserDTO; family: FamilyDTO } | null =
    JSON.parse(localStorage.getItem(AUTHENTICATION_CACHE_KEY) || "null");

  const session = reactive<Session>({
    state: cachedAuthentication
      ? AUTHENTICATED(cachedAuthentication.user, cachedAuthentication.family)
      : AUTHENTICATING(),
  });

  return session;
}
