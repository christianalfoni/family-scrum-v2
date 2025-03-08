import { Route, Routes } from "react-router";
import * as state from "../state";
import { Dashboard } from "./Dashboard";
import { Groceries } from "./Groceries";
import { CheckLists } from "./CheckLists";

type Props = {
  familyScrum: state.FamilyScrum;
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
    </Routes>
  );
}
