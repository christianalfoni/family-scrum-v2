import { createDataLookup, reactive } from "bonsify";
import { FamilyDTO } from "../environments/Browser/Persistence";

export type FamilyMember = {
  id: string;
  name: string;
  avatar: string;
};

export type Family = {
  id: string;
  members: FamilyMember[];
  membersById: Record<string, FamilyMember>;
};

type Params = {
  data: FamilyDTO;
};

export function Family({ data }: Params) {
  const members = createMembers();
  const family = reactive<Family>({
    id: data.id,
    members,
    membersById: createDataLookup(members),
  });

  return family;

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
