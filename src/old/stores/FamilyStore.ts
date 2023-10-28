import { derived, signal, store } from "impact-app";
import { UserDTO, useFirebase } from "./FirebaseStore";

export function FamilyStore(user: UserDTO) {
  const firebase = useFirebase();
  const familyCollection = firebase.collections.families();
  const family = signal(firebase.getDoc(familyCollection, user.familyId));
  const familyUsers = derived(() => {
    if (family.value.status !== "fulfilled") {
      return [];
    }

    return Object.entries(family.value.value.users)
      .sort(([key]) => {
        if (key === user.id) {
          return -1;
        }

        return 1;
      })
      .map(([id, familyUser]) => ({ id, ...familyUser }));
  });

  return {
    get family() {
      return family.value;
    },
    get familyUsers() {
      return familyUsers.value;
    },
  };
}

export const useFamily = () => store(FamilyStore);
