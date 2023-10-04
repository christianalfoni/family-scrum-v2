import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  User,
} from "firebase/auth";
import { signal, useCleanup, useStore } from "impact-app";
import { FirebaseStore, UserDTO } from "./FirebaseStore";

const provider = new GoogleAuthProvider();

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
  const { auth, getUser } = useStore(FirebaseStore);

  const state = signal<SessionState>({
    status: "AUTHENTICATING",
  });

  useCleanup(onAuthStateChanged(auth, handleAuthStateChanged));

  async function handleAuthStateChanged(user: User | null) {
    if (user) {
      try {
        const userDoc = await getUser(user.uid);

        // We might be unauthenticated during fetching the user doc, use RXJS to see how that could be solved?
        if (state.value.status === "AUTHENTICATING") {
          state.value = {
            status: "AUTHENTICATED",
            user: userDoc,
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
    signIn() {
      signInWithRedirect(auth, provider);
    },
  };
}
