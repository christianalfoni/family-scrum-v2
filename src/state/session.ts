import { User } from "firebase/auth";
import type { FamilyDTO, UserDTO } from "../environments/Browser/Persistence";
import { reactive, readonly } from "bonsify";
import { FamilyScrum } from "./FamilyScrum";
import { Environment } from "../environments";

type CachedAuthentication = { user: UserDTO; family: FamilyDTO };

export type SessionAuthenticated = {
  current: "AUTHENTICATED";
  user: UserDTO;
  family: FamilyDTO;
  familyScrum: FamilyScrum;
};

export type SessionAuthenticating = {
  current: "AUTHENTICATING";
};

export type SessionUnauthenticated = {
  current: "UNAUTHENTICATED";
  reason?: string;
  signIn(): void;
};

export type Session = {
  state: SessionAuthenticated | SessionAuthenticating | SessionUnauthenticated;
};

const AUTHENTICATION_CACHE_KEY = "family_scrum_authentication";

type Params = { env: Environment };

export function Session({ env }: Params) {
  const { authentication, persistence } = env;

  // We dispose of everything when signed out
  const disposers = new Set<() => void>();

  // It takes quite a long time for Firebase to evalaute the curent session, we
  // use a cached user and family to get rolling faster
  const cachedAuthentication: CachedAuthentication | null = JSON.parse(
    localStorage.getItem(AUTHENTICATION_CACHE_KEY) || "null"
  );

  const session = reactive<Session>({
    state: cachedAuthentication
      ? AUTHENTICATED(cachedAuthentication.user, cachedAuthentication.family)
      : AUTHENTICATING(),
  });

  authentication.onChanged(onAuthChanged);

  return readonly(session);

  function UNAUTHENTICATED(reason?: string): SessionUnauthenticated {
    disposers.forEach((dispose) => dispose());
    disposers.clear();

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

    const familyScrum = FamilyScrum({
      env,
      session: authenticated,
      onDispose(disposer) {
        disposers.add(disposer);
      },
    });

    return authenticated;
  }

  async function onAuthChanged(maybeUser: User | null) {
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
