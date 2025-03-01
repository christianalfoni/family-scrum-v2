import { User } from "firebase/auth";
import type { FamilyDTO, UserDTO } from "../context/firebase";
import { reactive } from "bonsify";
import { createFamilyScrum, FamilyScrumState } from "./familyScrum";
import { Context } from "../context";

export type SessionAuthenticated = {
  current: "AUTHENTICATED";
  user: UserDTO;
  family: FamilyDTO;
  familyScrum: FamilyScrumState;
};

export type SessionAuthenticating = {
  current: "AUTHENTICATING";
};

export type SessionUnauthenticated = {
  current: "UNAUTHENTICATED";
  reason?: string;
  signIn(): void;
};

export type SessionState = {
  state: SessionAuthenticated | SessionAuthenticating | SessionUnauthenticated;
};

const AUTHENTICATION_CACHE_KEY = "family_scrum_authentication";

export function createSession(apis: Context) {
  const { authentication, persistence } = apis;

  // It takes quite a long time for Firebase to evalaute the curent session, we
  // use a cached user and family to get rolling faster
  const cachedAuthentication: { user: UserDTO; family: FamilyDTO } | null =
    JSON.parse(localStorage.getItem(AUTHENTICATION_CACHE_KEY) || "null");

  const session = reactive<SessionState>({
    state: cachedAuthentication
      ? AUTHENTICATED(cachedAuthentication.user, cachedAuthentication.family)
      : AUTHENTICATING(),
  });

  authentication.onChanged(onAuthChanged);

  return session;

  function UNAUTHENTICATED(reason?: string): SessionUnauthenticated {
    return {
      current: "UNAUTHENTICATED",
      reason,
      signIn() {
        authentication.signIn();
      },
    };
  }

  function AUTHENTICATING(): SessionAuthenticating {
    return {
      current: "AUTHENTICATING",
    };
  }

  function AUTHENTICATED(user: UserDTO, family: FamilyDTO) {
    const authenticated: SessionAuthenticated = reactive({
      current: "AUTHENTICATED",
      user,
      family,
      get familyScrum() {
        return familyScrum;
      },
    });

    const familyScrum = createFamilyScrum(apis, authenticated);

    return authenticated;
  }

  async function onAuthChanged(maybeUser: User | null) {
    if (!maybeUser && session.state.current === "AUTHENTICATED") {
      session.state.familyScrum.dispose();
    }

    if (!maybeUser) {
      session.state = UNAUTHENTICATED();

      return;
    }

    try {
      // As part of being authenticated we also want to grab information
      // about the users family reference and the family itself
      const user = await persistence.users.get(maybeUser.uid);

      if (!user) {
        throw new Error("No user doc");
      }

      const family = await persistence.families.get(user.familyId);

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
  }
}
