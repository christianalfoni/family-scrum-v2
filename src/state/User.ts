import { reactive } from "bonsify";
import { UserDTO } from "../environments/Browser/Persistence";

export type User = UserDTO;

type Params = {
  data: UserDTO;
};

export function User({ data }: Params): User {
  const user = reactive<User>({
    ...data,
  });

  return reactive.readonly(user);
}
