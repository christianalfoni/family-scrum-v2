import { createContext, useContext } from "react";
import { FamilyDTO, UserDTO } from "../../environments/Browser/Persistence";
import { useReactive } from "use-reactive-react";
import { Groceries, useGroceries } from "./useGroceries";
import { Todos, useTodos } from "./useTodos";
import { Dinners, useDinners } from "./useDinners";
import { Weeks, useWeeks } from "./useWeeks";
import { Awake, useAwake } from "./useAwake";

export type FamilyScrum = {
  user: UserDTO;
  family: FamilyDTO;
  groceries: Groceries;
  todos: Todos;
  dinners: Dinners;
  weeks: Weeks;
  awake: Awake;
};

const FamilyScrumContext = createContext(null as unknown as FamilyScrum);

export function useFamilyScrum() {
  return useContext(FamilyScrumContext);
}

type Props = {
  user: UserDTO;
  family: FamilyDTO;
  children: React.ReactNode;
};

export function FamilyScrumProvider({ user, family, children }: Props) {
  const familyScrum = useReactive<FamilyScrum>({
    user,
    family,
    groceries: useGroceries(family.id),
    todos: useTodos({ familyId: family.id, userId: user.id }),
    dinners: useDinners(family.id),
    weeks: useWeeks(family.id),
    awake: useAwake(),
  });

  return (
    <FamilyScrumContext.Provider value={useReactive.readonly(familyScrum)}>
      {children}
    </FamilyScrumContext.Provider>
  );
}
