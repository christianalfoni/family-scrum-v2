import { User as FirebaseUser } from "firebase/auth";
import { FamilyDTO, UserDTO } from "../../environments/Browser/Persistence";
import { useEnv } from "../../environments";
import { useReactive, useReactiveEffect } from "use-reactive-react";

type CachedAuthentication = { user: UserDTO; family: FamilyDTO };

export type SessionAuthenticated = {
  current: "AUTHENTICATED";
  user: UserDTO;
  family: FamilyDTO;
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

export function useSession() {
  const env = useEnv();
  const { authentication, persistence } = env;

  // It takes quite a long time for Firebase to evalaute the curent session, we
  // use a cached user and family to get rolling faster
  const cachedAuthentication: CachedAuthentication | null = JSON.parse(
    localStorage.getItem(AUTHENTICATION_CACHE_KEY) || "null"
  );

  const session = useReactive<Session>({
    state: cachedAuthentication
      ? AUTHENTICATED(cachedAuthentication.user, cachedAuthentication.family)
      : AUTHENTICATING(),
  });

  useReactiveEffect(() => authentication.onChanged(onAuthChanged));

  return useReactive.readonly(session);

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

  function AUTHENTICATED(
    user: UserDTO,
    family: FamilyDTO
  ): SessionAuthenticated {
    return {
      current: "AUTHENTICATED",
      user,
      family,
    };
  }

  async function onAuthChanged(maybeUser: FirebaseUser | null) {
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

      if (
        session.state.current === "AUTHENTICATED" &&
        session.state.user.id === user.id &&
        session.state.user.familyId === user.familyId
      ) {
        return;
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
