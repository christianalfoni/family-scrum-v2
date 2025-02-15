import { useFamilyScrum } from "../../state";
import { Dashboard } from "../Dashboard";
import { Skeleton } from "../Dashboard/Skeleton";

export function FamilyScrum() {
  const familyScrum = useFamilyScrum();

  console.log(familyScrum);

  switch (familyScrum.view.name) {
    case "dashboard":
      return <Skeleton />;
  }

  return <h1 className="text-3xl font-bold underline">Hello There</h1>;
}
