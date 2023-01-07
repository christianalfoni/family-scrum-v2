import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type FreshState<T> = {
  status: "fresh";
  readonly data: T;
};

type StaleState<T> = {
  status: "stale";
  readonly data: T;
};

type WriteErrorState<T> = {
  status: "write_error";
  readonly data: T;
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
  readonly data: T;
};

type RefreshingErrorState<T> = {
  status: "refreshing_error";
  readonly data: T;
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

type InitializedCacheState<T> =
  | FreshState<T>
  | OptimisticState<T>
  | WriteErrorState<T>;

type AsyncCacheState<T> = CacheState<T>;

type SuspendedCacheState<T> =
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

type SuspendedSubscriptionCacheState<T> =
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
          type: "initialized";
        }
      | {
          type: "subscription";
          subscription: {
            dispose?: () => void;
            subscriber: () => () => void;
          };
        }
      | {
          type: "async";
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
  update<T>(key: string, state: CacheState<T>) {
    const entry = this.entries[key];

    if (!entry) {
      throw new Error("Can not update state on non existing entry");
    }

    entry.state = state;
    entry.subscribers.forEach((cb) => cb(state));
  }
  subscribe<T>(key: string, cb: Subscription<T>): () => void {
    const entry = this.entries[key];

    if (!entry) {
      throw new Error(
        "Can not subscribe to a resolver that has not been set yet"
      );
    }

    entry.subscribers.add(cb);

    if (
      entry.type === "subscription" &&
      entry.subscribers.size === 1 &&
      !entry.subscription.dispose
    ) {
      entry.subscription.dispose = entry.subscription.subscriber();
    }

    return () => {
      entry.subscribers.delete(cb);

      if (entry.type === "subscription" && !entry.subscribers.size) {
        entry.subscription.dispose?.();
        delete entry.subscription.dispose;
      }
    };
  }
  set<T>(key: string, initialData: T) {
    const state: FreshState<T> = {
      status: "fresh",
      data: initialData,
    };

    this.entries[key] = {
      type: "initialized",
      state,
      subscribers: new Set(),
    };

    return state;
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
      type: "async",
      state,
      subscribers: new Set(),
      resolver,
    };

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

    const wrappedSubscriber = () =>
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
      });

    this.entries[key] = {
      type: "subscription",
      state,
      subscribers: new Set(),
      subscription: {
        dispose: wrappedSubscriber(),
        subscriber: wrappedSubscriber,
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

interface UseAsyncCacheValue<
  T,
  S extends CacheState<T> | SuspendedCacheState<T>
> {
  write(optimisticData: T, promise: Promise<unknown>): void;
  write(optimisticData: (current: T) => T, promise: Promise<unknown>): void;
  read(): S;
  suspend(): UseAsyncCacheValue<T, SuspendedCacheState<T>>;
}

interface UseSubscriptionCacheValue<
  T,
  S extends SubscriptionCacheState<T> | SuspendedSubscriptionCacheState<T>
> {
  write(optimisticData: T, promise: Promise<unknown>): void;
  write(optimisticData: (current: T) => T, promise: Promise<unknown>): void;
  read(): S;
  suspend(): UseSubscriptionCacheValue<T, SuspendedSubscriptionCacheState<T>>;
}

interface UseInitializedCacheValue<T, S extends InitializedCacheState<T>> {
  write(data: T, promise?: Promise<unknown>): void;
  write(data: (current: T) => T, promise?: Promise<unknown>): void;
  read(): S;
}

function createSuspend(state: CacheState<unknown>) {
  return function (this: any) {
    if (state.status === "initializing") {
      throw state.promise;
    }
    if (state.status === "error") {
      throw state.error;
    }

    return this;
  };
}

function createAsyncWrite(
  key: string,
  state: CacheState<unknown>,
  cache: Cache
) {
  return function (data: unknown, promise: Promise<unknown>) {
    if (state.status === "error" || state.status === "initializing") {
      throw new Error(`You can not write to cache in an ${state.status} state`);
    }

    const prevData = state.data;
    const optimisticData = typeof data === "function" ? data(state.data) : data;

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
  };
}

function createAsyncCacheValue<T, S extends CacheState<T>>(
  key: string,
  state: S,
  cache: Cache
) {
  return {
    read() {
      return state;
    },
    suspend: createSuspend(state),
    write: createAsyncWrite(key, state, cache),
  };
}

function createCacheValue<T, S extends InitializedCacheState<T>>(
  key: string,
  state: S,
  cache: Cache
) {
  return {
    read() {
      return state;
    },
    write(data: unknown, promise?: Promise<unknown>) {
      if (promise) {
        const prevData = state.data;
        const optimisticData =
          typeof data === "function" ? data(state.data) : data;

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
        return;
      }

      cache.update(key, {
        status: "fresh",
        data: typeof data === "function" ? data(state.data) : data,
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
    () => createAsyncCacheValue(key, state, cache),
    [state]
  ) as UseSubscriptionCacheValue<T, SubscriptionCacheState<T>>;
}

export function useCache<T>(key: string, initialData: T) {
  const cache = useContext(cacheContext);
  const [state, setState] = useState<InitializedCacheState<T>>(() => {
    const existingState = cache.getState<T>(key);

    if (existingState) {
      return existingState as InitializedCacheState<T>;
    }

    return cache.set(key, initialData);
  });

  useEffect(() => cache.subscribe(key, setState), []);

  return useMemo(
    () => createCacheValue(key, state, cache),
    [state]
  ) as UseInitializedCacheValue<T, InitializedCacheState<T>>;
}
export function useAsyncCache<T>(key: string, resolver: () => Promise<T>) {
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
    () => createAsyncCacheValue(key, state, cache),
    [state]
  ) as UseAsyncCacheValue<T, AsyncCacheState<T>>;
}

export function useSuspendCaches<
  T extends
    | Array<UseAsyncCacheValue<any, any> | UseSubscriptionCacheValue<any, any>>
    | []
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
    [U in keyof T]: T[U] extends UseAsyncCacheValue<infer V, any>
      ? UseAsyncCacheValue<V, SuspendedCacheState<V>>
      : T[U] extends UseSubscriptionCacheValue<infer V, any>
      ? UseSubscriptionCacheValue<V, SuspendedSubscriptionCacheState<V>>
      : never;
  };
}
