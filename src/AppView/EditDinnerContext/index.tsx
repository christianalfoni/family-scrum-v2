import React from "react";

import { DinnerDTO } from "../../useGlobalContext/firebase";
import { useEditDinnerContext } from "./useEditDinnerContext";
import { EditDinner } from "./EditDinner";

export function EditDinnerContext({ dinner }: { dinner?: DinnerDTO }) {
  return (
    <useEditDinnerContext.Provider dinner={dinner}>
      <EditDinner />
    </useEditDinnerContext.Provider>
  );
}
