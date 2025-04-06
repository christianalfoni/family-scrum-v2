import { reactive } from "mobx-lite";
import { UserDTO } from "../environment/Persistence";

export type UserState = ReturnType<typeof UserState>;

type Params = {
  data: UserDTO;
};

export function UserState({ data }: Params) {
  const user = reactive({
    ...data,
  });

  return reactive.readonly(user);
}
