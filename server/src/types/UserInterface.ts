import { UserProviderType } from "~/models/UserProvider";

export interface UserInterface {
  username?: string;
  email: string;
  password?: string;
  provider?: UserProviderType;
}

export type LoginType = Pick<UserInterface, "email" | "password" | 'provider'>
export type RegisterType = Required<UserInterface>