import { Navigate, Route, Routes } from "react-router";
import { Dashboard } from "../Dashboard";
import { Groceries } from "../Groceries";
import { CheckLists } from "../CheckLists";
import { PlanNextWeek } from "../PlanNextWeek";
import { PlanNextWeekTodos } from "../PlanNextWeek/PlanNextWeekTodos";
import { PlanNextWeekDinners } from "../PlanNextWeek/PlanNextWeekDinners";
import { FamilyDTO, UserDTO } from "../../environments/Browser/Persistence";
import { FamilyScrumProvider, useFamilyScrum } from "./useFamilyScrum";

type Props = {
  user: UserDTO;
  family: FamilyDTO;
};

export function FamilyScrum({ user, family }: Props) {
  const familyScrum = useFamilyScrum({ user, family });

  return (
    <Routes>
      <Route path="/" element={<Dashboard familyScrum={familyScrum} />} />
      <Route path="/groceries" element={<Groceries />} />
      <Route path="/checklists" element={<CheckLists />} />
      <Route path="plan-next-week" element={<PlanNextWeek />}>
        <Route index element={<Navigate to="todos" replace />} />
        <Route path="todos" element={<PlanNextWeekTodos />} />
        <Route path="dinners" element={<PlanNextWeekDinners />} />
      </Route>
    </Routes>
  );
}
