import { TEmit } from "react-states";
import {
  Visibility,
  VisibilityEvent,
} from "../../environment-interface/visibility";

export const createVisibility = (emit: TEmit<VisibilityEvent>): Visibility => {
  document.addEventListener("visibilitychange", () => {
    emit({
      type:
        document.visibilityState === "visible"
          ? "VISIBILITY:VISIBLE"
          : "VISIBILITY:HIDDEN",
    });
  });

  return {};
};
