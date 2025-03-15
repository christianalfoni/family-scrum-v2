import { Navigate, Route, Routes } from "react-router";
import * as state from "../state";
import { Dashboard } from "./Dashboard";
import { Groceries } from "./Groceries";
import { CheckLists } from "./CheckLists";
import { PlanNextWeek } from "./PlanNextWeek";
import { PlanNextWeekTodos } from "./PlanNextWeek/PlanNextWeekTodos";
import { PlanNextWeekDinners } from "./PlanNextWeek/PlanNextWeekDinners";
import { FamilyDTO, UserDTO } from "../environments/Browser/Persistence";

type Props = {
  user: UserDTO;
  family: FamilyDTO;
};

export function FamilyScrum({ familyScrum }: Props) {
  return (
    <Routes>
      <Route path="/" element={<Dashboard familyScrum={familyScrum} />} />
      <Route
        path="/groceries"
        element={<Groceries groceries={familyScrum.groceries} />}
      />
      <Route
        path="/checklists"
        element={<CheckLists todos={familyScrum.todos} />}
      />
      <Route path="plan-next-week" element={<PlanNextWeek />}>
        <Route index element={<Navigate to="todos" replace />} />
        <Route
          path="todos"
          element={
            <PlanNextWeekTodos
              weeks={familyScrum.weeks}
              todos={familyScrum.todos}
            />
          }
        />
        <Route
          path="dinners"
          element={<PlanNextWeekDinners familyScrum={familyScrum} />}
        />
      </Route>
    </Routes>
  );
}
