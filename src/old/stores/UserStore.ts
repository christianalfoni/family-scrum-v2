import { signal, store } from "impact-app";
import { UserDTO } from "./FirebaseStore";

export function UserStore(userData: UserDTO) {
  const user = signal(userData);

  return {
    get id() {
      return user.value.id;
    },
    get familyId() {
      return user.value.familyId;
    },
  };
}

export const useUser = () => store(UserStore);
