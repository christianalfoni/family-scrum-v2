import { User } from "firebase/auth";
import { cleanup } from "impact-context";
import { signal } from "impact-signal";
import type { FamilyDTO, UserDTO, createFirebase } from "./firebase";

export type SessionState =
  | {
      status: "AUTHENTICATING";
    }
  | {
      status: "AUTHENTICATED";
      user: UserDTO;
      family: FamilyDTO;
    }
  | {
      status: "UNAUTHENTICATED";
      reason?: string;
    };

export function createAuthentication(
  firebase: ReturnType<typeof createFirebase>,
) {
  const usersCollection = firebase.collections.users();
  const familiesCollection = firebase.collections.families();
  const state = signal<SessionState>({
    status: "AUTHENTICATING",
  });

  cleanup(firebase.onAuthChanged(handleAuthStateChanged));

  async function handleAuthStateChanged(maybeUser: User | null) {
    if (maybeUser) {
      try {
        const lastStatus = state.value.status;

        const user = await firebase.getDoc(usersCollection, maybeUser.uid);

        if (!user) {
          throw new Error("No user doc");
        }

        const family = await firebase.getDoc(familiesCollection, user.familyId);

        if (!family) {
          throw new Error("No family doc");
        }

        // We might be unauthenticated during fetching the user doc, use RXJS to see how that could be solved?
        if (state.value.status === lastStatus) {
          state.value = {
            status: "AUTHENTICATED",
            user,
            family,
          };
        }
      } catch (e) {
        state.value = {
          status: "UNAUTHENTICATED",
          reason: String(e),
        };
      }
    } else {
      state.value = {
        status: "UNAUTHENTICATED",
      };
    }
  }

  return {
    get state() {
      return state.value;
    },
    signIn: firebase.signIn,
  };
}
