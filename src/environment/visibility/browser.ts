import { events } from "react-states";
import { Visibility, VisibilityEvent } from ".";

export const createVisibility = (): Visibility => {
  const visibilityEvents = events<VisibilityEvent>();

  document.addEventListener("visibilitychange", () => {
    visibilityEvents.emit({
      type:
        document.visibilityState === "visible"
          ? "VISIBILITY:VISIBLE"
          : "VISIBILITY:HIDDEN",
    });
  });

  return {
    events: visibilityEvents,
  };
};
