import * as state from "../../state";
import { Skeleton } from "../Dashboard/Skeleton";
import { useViews } from "./viewsContext";

type Props = {
  familyScrum: state.FamilyScrum;
};

export function FamilyScrum({ familyScrum }: Props) {
  const views = useViews();

  switch (views.current.name) {
    case "dashboard":
      return <Skeleton />;
  }

  return <h1 className="text-3xl font-bold underline">Hello There</h1>;
}
