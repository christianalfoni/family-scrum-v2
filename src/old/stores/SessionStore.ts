import { User } from "firebase/auth";
import { signal, cleanup, store } from "impact-app";
import { UserDTO, useFirebase } from "./FirebaseStore";

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
  const firebase = useFirebase();
  const usersCollection = firebase.collections.users();
  const state = signal<SessionState>({
    status: "AUTHENTICATING",
  });

  cleanup(firebase.onAuthChanged(handleAuthStateChanged));

  async function handleAuthStateChanged(maybeUser: User | null) {
    if (maybeUser) {
      try {
        const lastStatus = state.value.status;

        const user = await firebase.getDoc(usersCollection, maybeUser.uid);

        // We might be unauthenticated during fetching the user doc, use RXJS to see how that could be solved?
        if (state.value.status === lastStatus) {
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
    signIn: firebase.signIn,
  };
}

export const useSession = () => store(SessionStore);
