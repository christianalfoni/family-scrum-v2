import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  promise: Promise<unknown>;
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
  | InitializingState;

type InitializingCacheState<T> =
  | InitializingState
  | ErrorState
  | FreshState<T>
  | StaleState<T>
  | OptimisticState<T>
  | RefreshingState<T>
  | RefreshingErrorState<T>;

type InitializedCacheState<T> =
  | FreshState<T>
  | StaleState<T>
  | OptimisticState<T>
  | RefreshingState<T>
  | RefreshingErrorState<T>;

type UnInitializedCacheState<T> =
  | FreshState<T>
  | StaleState<T>
  | OptimisticState<T>
  | ErrorState
  | UninitializedState
  | InitializingState
  | RefreshingState<T>
  | RefreshingErrorState<T>;

type Subscription<T> = (data: T) => void;

export class Cache {
  private entries: Record<
    string,
    {
      state: CacheState<any>;
      subscribers: Set<Subscription<any>>;
      subscription?: {
        dispose: () => void;
        subscriber: () => () => void;
      };
    }
  > = {};
  get<T>(key: string): CacheState<T> | undefined {
    return this.entries[key]?.state;
  }
  subscribe<T>(key: string, cb: Subscription<T>): () => void {
    const entry = this.entries[key];

    if (!entry) {
      throw new Error(
        "Can not subscribe to a resolver that has not been set yet"
      );
    }

    entry.subscribers.add(cb);

    if (entry.subscription && entry.subscribers.size === 1) {
      entry.subscription.dispose = entry.subscription.subscriber();
    }

    return () => {
      entry.subscribers.delete(cb);

      if (entry.subscription && !entry.subscribers.size) {
        entry.subscription.dispose();
      }
    };
  }
  set<T>(key: string, state: CacheState<T>) {
    const entry = this.entries[key];

    if (entry) {
      entry.state = state;
      entry.subscribers.forEach((cb) => cb(state));
    } else {
      this.entries[key] = {
        state,
        subscribers: new Set(),
      };
    }

    return state;
  }
  setSubscription<T>(
    key: string,
    subscriber: (
      setCache: (data: T | ((current: T) => T)) => void
    ) => () => void
  ) {
    const entry = this.entries[key];

    if (entry) {
      return entry.state;
    }

    let _resolve: (() => void) | undefined;
    const promise = new Promise<void>((resolve) => {
      _resolve = resolve;
    });

    const state: InitializingState = {
      status: "initializing",
      promise,
    };

    this.entries[key] = {
      state,
      subscribers: new Set(),
      subscription: {
        dispose: () => {},
        subscriber: () =>
          subscriber((data) => {
            if (typeof data === "function") {
              const currentState = this.get(key)!;
              const dataCallback = data as (data: T | void) => T;

              this.set(key, {
                status: "fresh",
                data:
                  "data" in currentState
                    ? dataCallback(currentState.data as T)
                    : dataCallback(),
              });
            } else {
              this.set(key, {
                status: "fresh",
                data,
              });
            }

            if (_resolve) {
              _resolve();
              _resolve = undefined;
            }
          }),
      },
    };

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

interface SetInitializedCache<T> {
  (promisedData: Promise<T>): void;
  (promisedData: Promise<T>, optimisticData: T): void;
  (data: T): void;
  (data: (current: T) => T): void;
}

interface UseCacheValue<
  T,
  S extends
    | InitializedCacheState<T>
    | UnInitializedCacheState<T>
    | InitializingCacheState<T>
> {
  write(promisedData: Promise<T>): void;
  write(promisedData: Promise<T>, optimisticData: T): void;
  write(data: T): void;
  write(data: (current?: T) => T): void;
  read(): S;
  suspend(): UseCacheValue<T, InitializedCacheState<T>>;
}

function createCacheValue<
  T,
  S extends
    | InitializedCacheState<T>
    | UnInitializedCacheState<T>
    | InitializingCacheState<T>
>(cache: Cache, key: string) {
  return {
    read() {
      return cache.get(key)!;
    },
    suspend() {
      const state = cache.get(key)!;

      if (state.status === "initializing") {
        throw state.promise;
      }

      if (state.status === "error") {
        throw state.error;
      }

      return this;
    },
    write(...args: unknown[]) {
      if (args.length === 2 && args[0] instanceof Promise) {
        const promise = args[0];
        const optimisticData = args[1];

        cache.set(key, {
          status: "optimistic",
          data: optimisticData,
        });

        promise
          .then((data) =>
            cache.set(key, {
              status: "fresh",
              data,
            })
          )
          .catch((error) => {
            const state = cache.get(key)!;

            cache.set(
              key,
              state.status === "uninitialized" ||
                state.status === "error" ||
                state.status === "initializing"
                ? {
                    status: "error",
                    error,
                  }
                : {
                    status: "refreshing_error",
                    data: state.data,
                    error,
                  }
            );
          });
      } else if (args.length === 1 && args[0] instanceof Promise) {
        const promise = args[0];
        const state = cache.get(key)!;

        cache.set(
          key,
          state.status === "uninitialized" ||
            state.status === "error" ||
            state.status === "initializing"
            ? {
                status: "initializing",
                promise,
              }
            : {
                status: "refreshing",
                data: state.data,
              }
        );
        promise
          .then((data) =>
            cache.set(key, {
              status: "fresh",
              data,
            })
          )
          .catch((error) =>
            cache.set(
              key,
              state.status === "uninitialized" ||
                state.status === "error" ||
                state.status === "initializing"
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
      } else if (args.length === 1 && typeof args[0] === "function") {
        const state = cache.get(key)!;

        cache.set(key, {
          status: "fresh",
          data: args[0]("data" in state ? state.data : undefined),
        });
      } else if (args.length === 1) {
        cache.set(key, {
          status: "fresh",
          data: args[0],
        });
      }
    },
  } as unknown as UseCacheValue<T, S>;
}

export function useSubscriptionCache<T>(
  key: string,
  subscriber: (
    setCache: (data: T | ((current: T | undefined) => T)) => void
  ) => () => void
) {
  const cache = useContext(cacheContext);
  const [, setState] = useState<CacheState<T>>(() => {
    const existingState = cache.get<T>(key);

    if (existingState) {
      return existingState;
    }

    return cache.setSubscription(key, subscriber);
  });

  useEffect(() => cache.subscribe(key, setState), []);

  return useMemo(() => createCacheValue(cache, key), []);
}

export function useCache<T>(
  key: string,
  resolver: () => Promise<T>
): UseCacheValue<T, InitializingCacheState<T>>;
export function useCache<T>(
  key: string,
  data: T
): UseCacheValue<T, InitializedCacheState<T>>;
export function useCache<T>(
  key: string
): UseCacheValue<T, UnInitializedCacheState<T>>;
export function useCache<T>(
  key: string,
  dataOrResolver?: (T & Exclude<T, Function>) | (() => Promise<T>)
) {
  const cache = useContext(cacheContext);
  const [, setState] = useState<CacheState<T>>(() => {
    const existingState = cache.get<T>(key);

    if (existingState) {
      return existingState;
    }

    if (typeof dataOrResolver === "function") {
      const resolver = dataOrResolver as () => Promise<T>;

      return cache.set(key, {
        status: "initializing",
        promise: resolver()
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

  return useMemo(() => createCacheValue(cache, key), []);
}

export function useSuspenseCaches<
  T extends Array<UseCacheValue<any, any>> | []
>(cacheValues: T) {
  for (let cacheValue of cacheValues) {
    const state = cacheValue.read();

    if (state.status === "initializing") {
      throw state.promise;
    }
    if (state.status === "error") {
      throw state.error;
    }
  }

  return cacheValues as {
    [U in keyof T]: T[U] extends UseCacheValue<infer V, any>
      ? UseCacheValue<V, InitializedCacheState<V>>
      : never;
  };
}
