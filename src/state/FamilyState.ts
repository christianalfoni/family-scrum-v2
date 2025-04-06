import { reactive } from "mobx-lite";
import { FamilyDTO } from "../environment/Persistence";

export type FamilyMember = {
  id: string;
  name: string;
  avatar: string;
};

export type FamilyState = ReturnType<typeof FamilyState>;

type Params = {
  data: FamilyDTO;
};

export function FamilyState({ data }: Params) {
  const members = createMembers();
  const family = reactive({
    id: data.id,
    members,
  });

  return reactive.readonly(family);

  function createMembers() {
    const members: FamilyMember[] = [];

    for (const userId in data.users) {
      members.push({
        id: userId,
        name: data.users[userId].name,
        avatar: data.users[userId].avatar,
      });
    }

    return members;
  }
}
