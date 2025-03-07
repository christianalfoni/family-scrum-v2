import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";
import {
  GroceryDTO,
  UserDTO,
  TodoDTO,
  WeekDTO,
  WeekTodoDTO,
  DinnerDTO,
  FamilyDTO,
} from "./types";

function ensureTimestamp(timestamp: Timestamp | number): Timestamp {
  return timestamp instanceof Timestamp
    ? timestamp
    : Timestamp.fromMillis(timestamp);
}

export const user = {
  toFirestore(_: UserDTO): DocumentData {
    return {};
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): UserDTO {
    const data = snapshot.data({
      ...options,
      serverTimestamps: "estimate",
    });

    return {
      id: snapshot.id,
      familyId: data.familyId,
    };
  },
};

export const grocery = {
  toFirestore(grocery: GroceryDTO): DocumentData {
    return {
      ...grocery,
      id: undefined,
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
      created: ensureTimestamp(data.created),
      modified: ensureTimestamp(data.modified),
    };
  },
};

export const todos = {
  toFirestore(todo: TodoDTO): DocumentData {
    return {
      ...todo,
      id: undefined,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): TodoDTO {
    const data = snapshot.data({
      ...options,
      serverTimestamps: "estimate",
    });

    const todo: TodoDTO = {
      id: snapshot.id,
      created: ensureTimestamp(data.created),
      modified: ensureTimestamp(data.modified),
      description: data.description,
    };

    if (data.checkList !== undefined && data.checkList !== false) {
      todo.checkList = Array.isArray(data.checkList) ? data.checkList : [];
    }

    if (data.date !== undefined) {
      todo.date = ensureTimestamp(data.date);
    }

    if (data.time !== undefined) {
      todo.time = data.time;
    }

    if (data.grocery !== undefined) {
      todo.grocery = data.grocery;
    }

    return todo;
  },
};

export const week = {
  toFirestore(week: WeekDTO): DocumentData {
    return {
      ...week,
      id: undefined,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): WeekDTO {
    const data = snapshot.data({
      ...options,
      serverTimestamps: "estimate",
    });

    return {
      id: snapshot.id,
      dinners: data.dinners,
    };
  },
};

export const weekTodo = {
  toFirestore(week: WeekTodoDTO): DocumentData {
    return {
      ...week,
      id: undefined,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): WeekTodoDTO {
    const data = snapshot.data({
      ...options,
      serverTimestamps: "estimate",
    });

    return {
      id: snapshot.id,
      activityByUserId: data.activityByUserId,
    };
  },
};

export const dinner = {
  toFirestore(dinner: DinnerDTO): DocumentData {
    return {
      ...dinner,
      id: undefined,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): DinnerDTO {
    const data = snapshot.data({
      ...options,
      serverTimestamps: "estimate",
    });

    return {
      id: snapshot.id,
      created: ensureTimestamp(data.created),
      modified: ensureTimestamp(data.modified),
      description: data.description,
      groceries: data.groceries,
      instructions: data.instructions,
      name: data.name,
      preparationCheckList: data.preparationCheckList,
    };
  },
};

export const family = {
  toFirestore(family: FamilyDTO): DocumentData {
    return {
      ...family,
      id: undefined,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): FamilyDTO {
    const data = snapshot.data({
      ...options,
      serverTimestamps: "estimate",
    });

    return {
      id: snapshot.id,
      users: data.users,
    };
  },
};
