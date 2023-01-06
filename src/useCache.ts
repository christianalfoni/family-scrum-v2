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

type WriteErrorState<T> = {
  status: "write_error";
  data: T;
  error: unknown;
};

type OptimisticState<T> = {
  status: "optimistic";
  data: T;
};

type ErrorState = {
  status: "error";
  error: unknown;
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
  | InitializingState
  | ErrorState
  | FreshState<T>
  | StaleState<T>
  | OptimisticState<T>
  | WriteErrorState<T>
  | RefreshingState<T>
  | RefreshingErrorState<T>;

type SuspendCacheState<T> =
  | FreshState<T>
  | StaleState<T>
  | OptimisticState<T>
  | WriteErrorState<T>
  | RefreshingState<T>
  | RefreshingErrorState<T>;

type SubscriptionCacheState<T> =
  | InitializingState
  | FreshState<T>
  | OptimisticState<T>
  | WriteErrorState<T>;

type SuspendSubscriptionCacheState<T> =
  | FreshState<T>
  | OptimisticState<T>
  | WriteErrorState<T>;

type Subscription<T> = (data: T) => void;

export class Cache {
  private entries: Record<
    string,
    {
      state: CacheState<any>;
      subscribers: Set<Subscription<any>>;
    } & (
      | {
          type: "subscription";
          subscription: {
            dispose: () => void;
            subscriber: () => () => void;
          };
        }
      | {
          type: "resolver";
          resolver: () => Promise<any>;
        }
    )
  > = {};
  get(key: string) {
    return this.entries[key];
  }
  getState<T>(key: string): CacheState<T> | undefined {
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

    if (entry.type === "subscription" && entry.subscribers.size === 1) {
      entry.subscription.dispose = entry.subscription.subscriber();
    }

    return () => {
      entry.subscribers.delete(cb);

      if (entry.type === "subscription" && !entry.subscribers.size) {
        entry.subscription.dispose();
      }
    };
  }

  setResolver<T>(key: string, resolver: () => Promise<T>) {
    const state: InitializingState = {
      status: "initializing",
      promise: resolver()
        .then((data) => {
          this.update(key, {
            status: "fresh",
            data,
          });
        })
        .catch((error) => {
          this.update(key, {
            status: "error",
            error,
          });
        }),
    };

    this.entries[key] = {
      type: "resolver",
      state,
      subscribers: new Set(),
      resolver,
    };

    return state;
  }

  update<T>(key: string, state: CacheState<T>) {
    const entry = this.entries[key];

    if (!entry) {
      throw new Error("Can not update state on non existing entry");
    }

    entry.state = state;
    entry.subscribers.forEach((cb) => cb(state));
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
      type: "subscription",
      state,
      subscribers: new Set(),
      subscription: {
        dispose: () => {},
        subscriber: () =>
          subscriber((data) => {
            if (typeof data === "function") {
              const currentState = this.get(key)!;
              const dataCallback = data as (data: T | void) => T;

              this.update(key, {
                status: "fresh",
                data:
                  "data" in currentState
                    ? dataCallback(currentState.data as T)
                    : dataCallback(),
              });
            } else {
              this.update(key, {
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

interface UseCacheValue<T, S extends CacheState<T> | SuspendCacheState<T>> {
  write(optimisticData: T, promise: Promise<unknown>): void;
  write(optimisticData: (current: T) => T, promise: Promise<unknown>): void;
  read(): S;
  suspend(): UseCacheValue<T, SuspendCacheState<T>>;
}

interface UseSubscriptionCacheValue<
  T,
  S extends SubscriptionCacheState<T> | SuspendSubscriptionCacheState<T>
> {
  write(optimisticData: T, promise: Promise<unknown>): void;
  write(optimisticData: (current: T) => T, promise: Promise<unknown>): void;
  read(): S;
  suspend(): UseSubscriptionCacheValue<T, SuspendSubscriptionCacheState<T>>;
}

function createCacheValue<
  T,
  S extends
    | CacheState<T>
    | SuspendCacheState<T>
    | SubscriptionCacheState<T>
    | SuspendSubscriptionCacheState<T>
>(key: string, state: S, cache: Cache) {
  return {
    read() {
      return state;
    },
    suspend() {
      if (state.status === "initializing") {
        throw state.promise;
      }

      if (state.status === "error") {
        throw state.error;
      }

      return this;
    },
    write(data: unknown, promise: Promise<unknown>) {
      if (state.status === "error" || state.status === "initializing") {
        throw new Error(
          `You can not write to cache in an ${state.status} state`
        );
      }

      const prevData = state.data;
      const optimisticData = typeof data === "function" ? data(state) : data;

      cache.update(key, {
        status: "optimistic",
        data: optimisticData,
      });

      promise
        .then(() =>
          cache.update(key, {
            status: "fresh",
            data: optimisticData,
          })
        )
        .catch((error) => {
          cache.update(key, {
            status: "refreshing_error",
            data: prevData,
            error,
          });
        });
    },
  };
}

export function useSubscriptionCache<T>(
  key: string,
  subscriber: (
    setCache: (data: T | ((current: T | undefined) => T)) => void
  ) => () => void
) {
  const cache = useContext(cacheContext);
  const [state, setState] = useState<SubscriptionCacheState<T>>(() => {
    const existingState = cache.getState<T>(key);

    if (existingState) {
      return existingState as SubscriptionCacheState<T>;
    }

    return cache.setSubscription(key, subscriber) as SubscriptionCacheState<T>;
  });

  useEffect(() => cache.subscribe(key, setState), []);

  return useMemo(
    () => createCacheValue(key, state, cache),
    [state]
  ) as UseSubscriptionCacheValue<T, SubscriptionCacheState<T>>;
}

export function useCache<T>(key: string, resolver: () => Promise<T>) {
  const cache = useContext(cacheContext);
  const [state, setState] = useState<CacheState<T>>(() => {
    const existingState = cache.getState<T>(key);

    if (existingState) {
      return existingState;
    }

    return cache.setResolver(key, resolver);
  });

  useEffect(() => cache.subscribe(key, setState), []);

  return useMemo(
    () => createCacheValue(key, state, cache),
    [state]
  ) as UseCacheValue<T, CacheState<T>>;
}

export function useSuspendCaches<T extends Array<UseCacheValue<any, any>> | []>(
  cacheValues: T
) {
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
      ? UseCacheValue<V, SuspendCacheState<V>>
      : never;
  };
}
