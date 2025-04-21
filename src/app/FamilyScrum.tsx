import { Navigate, Route, Routes } from "react-router";
import { Dashboard } from "./Dashboard";
import { Groceries } from "./Groceries";
import { CheckLists } from "./CheckLists";
import { FamilyScrumState } from "../state/FamilyScrumState";
import { FamilyScrumContext } from "./FamilyScrumContext";
import { PlanNextWeek } from "./PlanNextWeek";
import { PlanNextWeekTodos } from "./PlanNextWeek/PlanNextWeekTodos";
import { Dinners } from "./Dinners";
import { PlanNextWeekDinners } from "./PlanNextWeek/PlanNextWeekDinners";
import { EditDinner, NewDinner } from "./EditDinner";
import { EditTodo, NewTodo } from "./EditTodo";
import { Layout } from "./Layout";

type Props = {
  familyScrum: FamilyScrumState;
};

export function FamilyScrum({ familyScrum }: Props) {
  return (
    <Layout avatar={familyScrum.family.users[familyScrum.user.id].avatar}>
      <FamilyScrumContext.Provider value={familyScrum}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/groceries" element={<Groceries />} />
          <Route path="/checklists" element={<CheckLists />} />
          <Route path="/dinners" element={<Dinners />} />
          <Route path="/dinners/new" element={<NewDinner />} />
          <Route path="/dinners/:id" element={<EditDinner />} />
          <Route path="/todos/new" element={<NewTodo />} />
          <Route path="/todos/:id" element={<EditTodo />} />
          <Route path="/plan-next-week" element={<PlanNextWeek />}>
            <Route index element={<Navigate to="todos" replace />} />
            <Route path="todos" element={<PlanNextWeekTodos />} />
            <Route path="dinners" element={<PlanNextWeekDinners />} />
          </Route>
        </Routes>
      </FamilyScrumContext.Provider>
    </Layout>
  );
}
