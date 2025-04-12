import { Navigate, Route, Routes } from "react-router";
import { Dashboard } from "./Dashboard";
import { Groceries } from "./Groceries";
import { CheckLists } from "./CheckLists";
import { FamilyScrumState } from "../state/FamilyScrumState";
import { FamilyScrumContext } from "./FamilyScrumContext";
import { PlanNextWeek } from "./PlanNextWeek";
import { PlanNextWeekTodos } from "./PlanNextWeek/PlanNextWeekTodos";
import { PlanNextWeekDinners } from "./PlanNextWeek/PlanNextWeekDinners";

type Props = {
  familyScrum: FamilyScrumState;
};

export function FamilyScrum({ familyScrum }: Props) {
  return (
    <FamilyScrumContext.Provider value={familyScrum}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/groceries" element={<Groceries />} />
        <Route path="/checklists" element={<CheckLists />} />

        <Route path="plan-next-week" element={<PlanNextWeek />}>
          <Route index element={<Navigate to="todos" replace />} />
          <Route path="todos" element={<PlanNextWeekTodos />} />
          <Route path="dinners" element={<PlanNextWeekDinners />} />
        </Route>
      </Routes>
    </FamilyScrumContext.Provider>
  );
}
