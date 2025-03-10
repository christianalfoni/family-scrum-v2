import { reactive } from "bonsify";
import { FamilyDTO } from "../environments/Browser/Persistence";

export type FamilyMember = {
  id: string;
  name: string;
  avatar: string;
};

export type Family = {
  id: string;
  members: FamilyMember[];
};

type Params = {
  data: FamilyDTO;
};

export function Family({ data }: Params) {
  const members = createMembers();
  const family = reactive<Family>({
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
