import { UserInterface } from "./UserInterface";

export interface TokenResponse {
  user: UserInterface;
  accessToken: string;
  refreshToken: string;
}
