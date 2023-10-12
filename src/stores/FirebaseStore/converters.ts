import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { GroceryDTO } from "./types";

export const groceriesConverter = {
  toFirestore(grocery: GroceryDTO): DocumentData {
    return {
      name: grocery.name,
      dinnerId: grocery.dinnerId,
      created: grocery.created,
      modified: grocery.modified,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): GroceryDTO {
    const data = snapshot.data({
      ...options,
      serverTimestamps: "estimate",
    });

    return {
      id: snapshot.id,
      name: data.name,
      dinnerId: data.dinnerId,
      created: data.created.toMillis?.() ?? data.created,
      modified: data.modified.toMillis?.() ?? data.modified,
    };
  },
};
