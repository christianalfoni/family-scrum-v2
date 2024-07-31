import { signal, Signal } from "impact-react";
import { createDinners } from "./dinners";
import { FamilyDTO, Firebase, UserDTO } from "../firebase";
import { createGroceries } from "./groceries";
import { createTodos } from "./todos";

export type FamilyScrum = ReturnType<typeof createFamilyScrum>;

export function createFamilyScrum(
  firebase: Firebase,
  user: UserDTO,
  family: FamilyDTO
) {
  const imageUrls: Record<string, Signal<Promise<string | null>>> = {};
  const dinners = signal(createDinners(firebase, user));
  const groceries = signal(createGroceries(firebase, user));
  const todos = signal(createTodos(firebase, user));

  return {
    get user() {
      return user;
    },
    get family() {
      return family;
    },
    get dinners() {
      return dinners();
    },
    get groceries() {
      return groceries();
    },
    get todos() {
      return todos();
    },
    fetchImageUrl(collection: string, id: string) {
      const ref = collection + "/" + id;

      let imageUrl = imageUrls[ref];

      if (!imageUrl) {
        imageUrl = imageUrls[ref] = signal(
          firebase.getImageUrl(ref).catch(() => null)
        );
      }

      return imageUrl();
    },
    async dispose() {
      const disposables = await Promise.all([dinners(), groceries(), todos()]);
      disposables.forEach((disposable) => disposable.dispose());
    },
  };
}
