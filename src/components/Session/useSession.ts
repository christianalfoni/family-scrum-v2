import { User as FirebaseUser } from "firebase/auth";
import { FamilyDTO, UserDTO } from "../../environments/Browser/Persistence";
import { useEnv } from "../../environments";
import { useSignals } from "use-react-signals";
import { useEffect, useState } from "react";

type CachedAuthentication = { user: UserDTO; family: FamilyDTO };

export type AUTHENTICATED = {
  current: "AUTHENTICATED";
  user: UserDTO;
  family: FamilyDTO;
};

export type AUTHENTICATING = {
  current: "AUTHENTICATING";
};

export type UNAUTHENTICATED = {
  current: "UNAUTHENTICATED";
  reason?: string;
  signIn(): void;
};

export type Session = AUTHENTICATED | AUTHENTICATING | UNAUTHENTICATED;

const AUTHENTICATION_CACHE_KEY = "family_scrum_authentication";

export function useSession() {
  const env = useEnv();
  const { authentication, persistence } = env;

  // It takes quite a long time for Firebase to evalaute the curent session, we
  // use a cached user and family to get rolling faster
  const cachedAuthentication: CachedAuthentication | null = JSON.parse(
    localStorage.getItem(AUTHENTICATION_CACHE_KEY) || "null"
  );

  const [session, setSession] = useState<Session>(
    cachedAuthentication
      ? AUTHENTICATED(cachedAuthentication.user, cachedAuthentication.family)
      : AUTHENTICATING()
  );

  useEffect(() => authentication.onChanged(onAuthChanged), []);

  return session;

  function UNAUTHENTICATED(reason?: string): UNAUTHENTICATED {
    return {
      current: "UNAUTHENTICATED",
      reason,
      signIn() {
        authentication.signIn();
      },
    };
  }

  function AUTHENTICATING(): AUTHENTICATING {
    return {
      current: "AUTHENTICATING",
    };
  }

  function AUTHENTICATED(user: UserDTO, family: FamilyDTO): AUTHENTICATED {
    return {
      current: "AUTHENTICATED",
      user,
      family,
    };
  }

  async function onAuthChanged(maybeUser: FirebaseUser | null) {
    if (!maybeUser) {
      setSession(UNAUTHENTICATED());

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
        session.current === "AUTHENTICATED" &&
        session.user.id === user.id &&
        session.family.id === family.id
      ) {
        return;
      }

      // Theoretically we could already be unauthenticated by Firebase for whatever reason. Something
      // like RxJS would be interesting to explore here.
      setSession(AUTHENTICATED(user, family));

      localStorage.setItem(
        AUTHENTICATION_CACHE_KEY,
        JSON.stringify({ user, family })
      );
    } catch (e) {
      setSession(UNAUTHENTICATED(String(e)));
    }
  }
}
