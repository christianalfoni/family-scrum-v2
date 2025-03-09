import { Observer } from "bonsify/observer";
import { useEffect, useMemo, useState } from "react";

export function useComputed<T>(computeFn: () => T): T {
  const [snapshot, setSnapshot] = useState(0);
  const { observer, result } = useMemo(() => {
    const observer = new Observer();
    const untrack = observer.track();
    try {
      return {
        result: computeFn(),
        observer,
      };
    } finally {
      untrack();
    }
  }, [snapshot]);

  useEffect(
    () =>
      observer.subscribe(() => {
        setSnapshot(observer.getSnapshot());
      }),
    [observer]
  );

  return result;
}
