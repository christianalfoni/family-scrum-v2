import { User as FirebaseUser } from "firebase/auth";
import type { FamilyDTO, UserDTO } from "../environment/Persistence";
import { reactive } from "mobx-lite";
import { FamilyScrumState } from "./FamilyScrumState";
import { Environment } from "../environment";

type CachedAuthentication = { user: UserDTO; family: FamilyDTO };

const AUTHENTICATION_CACHE_KEY = "family_scrum_authentication";

type Params = { env: Environment };

export function SessionState({ env }: Params) {
  const { authentication, persistence } = env;

  // It takes quite a long time for Firebase to evalaute the curent session, we
  // use a cached user and family to get rolling faster
  const cachedAuthentication: CachedAuthentication | null = JSON.parse(
    localStorage.getItem(AUTHENTICATION_CACHE_KEY) || "null"
  );
  const initialState = cachedAuthentication
    ? AUTHENTICATED(cachedAuthentication.user, cachedAuthentication.family)
    : AUTHENTICATING();

  const state = reactive({
    state: initialState as
      | ReturnType<typeof AUTHENTICATED>
      | ReturnType<typeof AUTHENTICATING>
      | ReturnType<typeof UNAUTHENTICATED>,
  });

  authentication.onChanged(onAuthChanged);

  return reactive.readonly(state);

  function UNAUTHENTICATED(reason?: string) {
    return {
      current: "UNAUTHENTICATED" as const,
      reason,
      signIn() {
        authentication.signIn();
      },
    };
  }

  function AUTHENTICATING() {
    return {
      current: "AUTHENTICATING" as const,
    };
  }

  function AUTHENTICATED(user: UserDTO, family: FamilyDTO) {
    const authenticated = reactive({
      current: "AUTHENTICATED" as const,
      user,
      family,
      familyScrum: FamilyScrumState({
        env,
        user,
        family,
      }),
    });

    return authenticated;
  }

  async function onAuthChanged(maybeUser: FirebaseUser | null) {
    if (!maybeUser) {
      state.state = UNAUTHENTICATED();

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
        state.state.current === "AUTHENTICATED" &&
        state.state.user.id === user.id &&
        state.state.user.familyId === user.familyId
      ) {
        return;
      }

      // Theoretically we could already be unauthenticated by Firebase for whatever reason. Something
      // like RxJS would be interesting to explore here.
      state.state = AUTHENTICATED(user, family);

      localStorage.setItem(
        AUTHENTICATION_CACHE_KEY,
        JSON.stringify({ user, family })
      );
    } catch (e) {
      state.state = UNAUTHENTICATED(String(e));
    }
  }
}
