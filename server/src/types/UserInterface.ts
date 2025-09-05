export interface UserInterface {
  username?: string;
  email: string;
  password?: string;
}

export type LoginType = Pick<UserInterface, "email" | "password">
export type RegisterType =  Required<UserInterface>