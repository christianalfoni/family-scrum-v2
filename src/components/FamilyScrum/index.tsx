import { FamilyScrumState } from "../../state/familyScrum";
import { Skeleton } from "../Dashboard/Skeleton";

export function FamilyScrum({
  familyScrum,
}: {
  familyScrum: FamilyScrumState;
}) {
  switch (familyScrum.view.name) {
    case "dashboard":
      return <Skeleton />;
  }

  return <h1 className="text-3xl font-bold underline">Hello There</h1>;
}
