import React, { createContext, useContext, useEffect, useState } from "react";

type FreshState<T> = {
  status: "fresh";
  data: T;
};

type StaleState<T> = {
  status: "stale";
  data: T;
};

type OptimisticState<T> = {
  status: "optimistic";
  data: T;
};

type ErrorState = {
  status: "error";
  error: unknown;
};

type UninitializedState = {
  status: "uninitialized";
};

type InitializingState = {
  status: "initializing";
};

type SuspendingState = {
  status: "suspending";
  suspender: Promise<void>;
};

type RefreshingState<T> = {
  status: "refreshing";
  data: T;
};

type RefreshingErrorState<T> = {
  status: "refreshing_error";
  data: T;
  error: unknown;
};

type CacheState<T> =
  | FreshState<T>
  | StaleState<T>
  | OptimisticState<T>
  | RefreshingState<T>
  | RefreshingErrorState<T>
  | ErrorState
  | UninitializedState
  | SuspendingState
  | InitializingState;

type Subscription<T> = (data: T) => void;

type CacheValue =
  | string
  | boolean
  | number
  | Record<string, unknown>
  | Array<unknown>
  | null;

export class Cache {
  private entries: Record<string, CacheState<any>> = {};
  private subscriptions: Record<string, Set<Subscription<any>>> = {};
  get<T>(key: string): CacheState<T> | undefined {
    return this.entries[key];
  }
  subscribe<T>(key: string, cb: Subscription<T>): () => void {
    const subscribers = this.subscriptions[key];

    if (!subscribers) {
      throw new Error(
        "Can not subscribe to a resolver that has not been set yet"
      );
    }
    subscribers.add(cb);

    return () => {
      subscribers.delete(cb);
    };
  }
  set<T>(key: string, state: CacheState<T>) {
    this.entries[key] = state;

    if (this.subscriptions[key]) {
      this.subscriptions[key].forEach((cb) => cb(state));
    } else {
      this.subscriptions[key] = new Set();
    }

    return state;
  }
}

export const cacheContext = createContext(null as unknown as Cache);

export const CacheProvider: React.FC<{ cache: Cache }> = ({
  children,
  cache,
}) =>
  React.createElement(cacheContext.Provider, {
    value: cache,
    children,
  });

interface SetCache<T> {
  (data: T): void;
  (promisedData: Promise<T>): void;
  (promisedData: Promise<T>, optimisticData: T): void;
}

export function useCache<T extends CacheValue>(
  key: string,
  resolver: () => Promise<T>
): [
  (
    | FreshState<T>
    | StaleState<T>
    | OptimisticState<T>
    | RefreshingState<T>
    | RefreshingErrorState<T>
  ),
  SetCache<T>
];
export function useCache<T extends CacheValue>(
  key: string,
  data: T
): [
  (
    | FreshState<T>
    | StaleState<T>
    | OptimisticState<T>
    | ErrorState
    | RefreshingState<T>
    | RefreshingErrorState<T>
  ),
  SetCache<T>
];
export function useCache<T extends CacheValue>(
  key: string
): [
  (
    | FreshState<T>
    | StaleState<T>
    | OptimisticState<T>
    | ErrorState
    | UninitializedState
    | InitializingState
    | RefreshingState<T>
    | RefreshingErrorState<T>
  ),
  SetCache<T>
];
export function useCache<T extends CacheValue>(
  key: string,
  dataOrResolver?: T | (() => Promise<T>)
) {
  const cache = useContext(cacheContext);
  const [state, setState] = useState<CacheState<T>>(() => {
    const existingState = cache.get<T>(key);

    if (existingState) {
      return existingState;
    }

    if (typeof dataOrResolver === "function") {
      const resolver = dataOrResolver;

      return cache.set(key, {
        status: "suspending",
        suspender: resolver()
          .then((data) => {
            cache.set(key, {
              status: "fresh",
              data,
            });
          })
          .catch((error) => {
            cache.set(key, {
              status: "error",
              error,
            });
          }),
      });
    }

    if (typeof dataOrResolver === "undefined") {
      return cache.set(key, {
        status: "uninitialized",
      });
    }

    const data = dataOrResolver;

    return cache.set(key, {
      status: "fresh",
      data,
    });
  });

  useEffect(() => cache.subscribe(key, setState), []);

  if (state.status === "suspending") {
    throw state.suspender;
  }

  if (state.status === "error") {
    throw state.error;
  }

  return [
    state,
    (...args: unknown[]) => {
      if (
        state.status !== "uninitialized" &&
        state.status !== "fresh" &&
        state.status !== "stale"
      ) {
        throw new Error("You can not update a cache that is " + state.status);
      }

      if (args.length === 2 && args[0] instanceof Promise) {
        const promise = args[0] as Promise<T>;
        const optimisticData = args[1] as T;

        setState({
          status: "optimistic",
          data: optimisticData,
        });
        promise
          .then((data) =>
            setState({
              status: "fresh",
              data,
            })
          )
          .catch((error) =>
            setState(
              state.status === "uninitialized"
                ? {
                    status: "error",
                    error,
                  }
                : {
                    status: "refreshing_error",
                    data: state.data,
                    error,
                  }
            )
          );
      } else if (args.length === 1 && args[0] instanceof Promise) {
        const promise = args[0] as Promise<T>;

        setState(
          state.status === "uninitialized"
            ? {
                status: "initializing",
              }
            : {
                status: "refreshing",
                data: state.data,
              }
        );
        promise
          .then((data) =>
            setState({
              status: "fresh",
              data,
            })
          )
          .catch((error) =>
            setState(
              state.status === "uninitialized"
                ? {
                    status: "error",
                    error,
                  }
                : {
                    status: "refreshing_error",
                    data: state.data,
                    error,
                  }
            )
          );
      } else if (args.length === 1) {
        setState({
          status: "fresh",
          data: args[0] as T,
        });
      }
    },
  ] as any;
}
