import { User } from "firebase/auth";
import { signal, useCleanup, useStore } from "impact-app";
import { FirebaseStore, UserDTO } from "./FirebaseStore";

type SessionState =
  | {
      status: "AUTHENTICATING";
    }
  | {
      status: "AUTHENTICATED";
      user: UserDTO;
    }
  | {
      status: "UNAUTHENTICATED";
      reason?: string;
    };

export function SessionStore() {
  const { signIn, getUser, onAuthChanged } = useStore(FirebaseStore);

  const state = signal<SessionState>({
    status: "AUTHENTICATING",
  });

  useCleanup(onAuthChanged(handleAuthStateChanged));

  async function handleAuthStateChanged(maybeUser: User | null) {
    if (maybeUser) {
      try {
        const user = await getUser(maybeUser.uid);

        // We might be unauthenticated during fetching the user doc, use RXJS to see how that could be solved?
        if (state.value.status === "AUTHENTICATING") {
          state.value = {
            status: "AUTHENTICATED",
            user: user,
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
    signIn,
  };
}
