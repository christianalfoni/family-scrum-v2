import { doc, getFirestore, setDoc } from "firebase/firestore";
import { DINNERS_COLLECTION, useFirebase } from "../useFirebase";
import { useCollection } from "./useCollection";
import { User } from "./useCurrentUser";
import { getFamilyDocRef } from "./useFamily";

export type DinnerDTO = {
  id: string;
  name: string;
  description: string;
  preparationCheckList: string[];
  groceries: string[];
  instructions: string[];
  created: number;
  modified: number;
};

export type Dinners = Record<string, DinnerDTO>;

export const useDinners = (user: User) =>
  useCollection<Dinners>(DINNERS_COLLECTION, user);

export const getDinnerImageRef = (id: string) => `dinners/${id}`;

export const useCreateDinnerId = (user: User) => {
  const app = useFirebase();
  const firestore = getFirestore(app);

  return () => doc(getFamilyDocRef(firestore, user), DINNERS_COLLECTION).id;
};

export const useStoreDinner = (
  user: User,
  {
    id,
    description,
    groceries,
    instructions,
    name,
    preparationCheckList,
  }: Pick<
    DinnerDTO,
    | "id"
    | "description"
    | "groceries"
    | "instructions"
    | "name"
    | "preparationCheckList"
  >,
  imageSrc: string
) => {
  const dinnersCache = useDinners(user).suspend();
  const dinners = dinnersCache.read().data;
  const app = useFirebase();
  const firestore = getFirestore(app);

  return () => {
    const dinner: DinnerDTO = dinners[id]
      ? {
          ...dinners[id],
          name,
          description,
          groceries,
          instructions,
          preparationCheckList,
          modified: Date.now(),
        }
      : {
          id,
          description,
          groceries,
          instructions,
          name,
          preparationCheckList,
          created: Date.now(),
          modified: Date.now(),
        };

    const { id: _, ...data } = dinner;
    const dinnerDocRef = doc(
      getFamilyDocRef(firestore, user),
      DINNERS_COLLECTION,
      id
    );

    dinnersCache.write(
      (current) => ({
        ...current,
        [id]: dinner,
      }),
      setDoc(dinnerDocRef, data)
    );

    if (imageSrc) {
      const imageRef = getDinnerImageRef(id);

      images[imageRef] = imageSrc;

      app
        .storage()
        .ref(imageRef + ".png")
        .putString(imageSrc, "data_url")
        .then(() => {
          emit({
            type: "STORAGE:STORE_IMAGE_SUCCESS",
            ref: imageRef,
          });
        })
        .catch((error) => {
          emit({
            type: "STORAGE:STORE_IMAGE_ERROR",
            error: error.message,
            ref: imageRef,
          });
        });
    }
  };
};
