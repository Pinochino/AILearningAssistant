import { IUser } from "~/models/User";
import { UserInterface } from "./UserInterface";

export interface TokenResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}
