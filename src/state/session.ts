import { User } from "firebase/auth";
import type { FamilyDTO, UserDTO } from "../utils/firebase";
import { reactive } from "bonsify";
import { createFamilyScrum, FamilyScrum } from "./familyScrum";
import { Utils } from ".";

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

export function createSession(utils: Utils) {
  const UNAUTHENTICATED = (reason?: string): UNAUTHENTICATED => ({
    current: "UNAUTHENTICATED",
    reason,
    signIn() {
      utils.firebase.signIn();
    },
  });
  const AUTHENTICATING = (): AUTHENTICATING => ({ current: "AUTHENTICATING" });
  const AUTHENTICATED = (user: UserDTO, family: FamilyDTO): AUTHENTICATED => ({
    current: "AUTHENTICATED",
    familyScrum: createFamilyScrum(utils, user, family),
  });

  const { firebase } = utils;
  const usersCollection = firebase.collections.users();
  const familiesCollection = firebase.collections.families();

  // As part of being authenticated we also want to grab information
  // about the users family reference and the family itself
  firebase.onAuthChanged(async (maybeUser: User | null) => {
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
