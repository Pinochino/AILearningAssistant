import { User } from "~/models/User"
import { TokenResponse } from "~/types/TokenResponse";
import { LoginType, RegisterType, UserInterface } from "~/types/UserInterface"
import { compareHashed } from "~/utils/BcryptUtils";
import { decodeJwt } from "~/utils/JwtUtils";
import { ValidatedToken } from "~/models/ValidatedToken";
import { Role, RoleName } from "~/models/Role";
import crypto from 'crypto';
import { JwtPayloadInterface } from "~/types/JwtPayload";

const authService = {
  authenticate: async ({ email, password }: LoginType): Promise<TokenResponse> => {
    try {
      const user = await User.findOne({ email }).populate('role', "name");

      if (!user) {
        throw new Error("Invalid credentials")
      }

      const isValid = await compareHashed(password as string,
        user.password as string);

      if (!isValid) {
        throw new Error("Invalid credentials")
      }

      const roles: string[] = user.role.map((e: any) => e.name);

      const authPayload: JwtPayloadInterface = {
        id: user._id,
        username: user.username ? user.username : '',
        email: user.email ? user.email : '',
        roles
      }


      const accessToken = decodeJwt(authPayload)
      const refreshToken = crypto.randomBytes(32).toString('hex');

      // await ValidatedToken.create({
      //   token: refreshToken,
      //   userId: user._id,
      //   issuedAt: Date.now(),
      //   expiredAt: Date.now() * 60 * 60,
      // })

      return {
        user: user as UserInterface,
        accessToken,
        refreshToken
      };

    } catch (error: any) {
      throw new Error("Error in login: " + error?.message)
    }
  },

  createUser: async ({ email, username, password }: RegisterType) => {
    try {
      console.log(email)
      let user = await User.findOne({ email })

      if (user) {
        throw new Error("User already have been existed")
      }

      let role = await Role.findOne({ name: RoleName.USER });
      if (!role) {
        role = await Role.create({ name: RoleName.USER });
      }

      user = await User.create({ username, email, password, role: role._id })

      return user.populate('role', 'name');
    } catch (error: any) {
      throw new Error("Error in register: " + error?.message)

    }

  },

  refreshToken: async (userId: string, refreshToken: string) => {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User id is not valid");
    }

    const validToken = await ValidatedToken.find({
      userId: user._id,
      token: refreshToken,
    })

    if (!validToken) {
      throw new Error("Refresh token is wrong");
    }

  },

  logout: async (userId: string) => {


  },
}
export default authService
