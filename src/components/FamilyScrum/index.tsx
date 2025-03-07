import * as state from "../../state";
import { Skeleton } from "../Dashboard/Skeleton";

type Props = {
  familyScrum: state.FamilyScrum;
};

export function FamilyScrum({ familyScrum }: Props) {
  switch (views.current.name) {
    case "dashboard":
      return <Skeleton />;
  }

  return <h1 className="text-3xl font-bold underline">Hello There</h1>;
}
