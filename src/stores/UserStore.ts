import { signal, useStore } from "impact-app";
import { UserDTO } from "./FirebaseStore";

export function UserStore(userData: UserDTO) {
  const user = signal(userData);

  return {
    get familyId() {
      return user.value.familyId;
    },
  };
}

export const useUser = () => useStore(UserStore);
