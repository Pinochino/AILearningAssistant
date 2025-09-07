import { User } from "~/models/User"
import { TokenResponse } from "~/types/TokenResponse";
import { LoginType, RegisterType, UserInterface } from "~/types/UserInterface"
import { compareHashed } from "~/utils/BcryptUtils";
import { ValidatedToken, ValidatedTokenStatus } from "~/models/ValidatedToken";
import { Role, RoleName } from "~/models/Role";
import crypto from 'crypto';
import { JwtPayloadInterface } from "~/types/JwtPayload";
import emailService from "./emailService";
import { validateHeaderName } from "http";
import { generateAccessToken } from "~/utils/JwtUtils";
import { transporter } from "~/configs/emailConfig";
import { ForgotPassword } from "~/models/ForgotPassword";

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

      const accessToken = generateAccessToken(user)
      const refreshToken = crypto.randomBytes(32).toString('hex');

      await ValidatedToken.create({
        token: refreshToken,
        userId: user._id,
        issuedAt: Date.now(),
        expiredAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      })

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

      await emailService.sendEmail({
        from: "Tranhunghp22112004@gmail.com",
        to: user.email as string,
        subject: "Welcome to LearningAssistant",
        text: "Thank you for registering with LearningAssistant!"
      })

      return user.populate('role', 'name');
    } catch (error: any) {
      throw new Error("Error in register: " + error?.message)

    }

  },

  refreshToken: async (refreshToken: string) => {

    const validToken = await ValidatedToken.findOne({
      token: refreshToken,
    })

    if (!validToken) {
      throw new Error("Refresh token is wrong");
    }

    const user = await User.findById(validToken?.userId);

    if (!user) {
      throw new Error("User id is not valid");
    }

    if (validToken.status !== ValidatedTokenStatus.ACTIVE) {
      throw new Error("Refresh token is not active")
    }

    const checkTime = validToken.expiredAt;

    if (!checkTime) {
      throw new Error("Expired at is null");
    }

    if (checkTime < new Date()) {
      validToken.status = ValidatedTokenStatus.EXPIRED
      await validToken.save();
      throw new Error("Refresh token is expired")
    }

    const accessToken = generateAccessToken(user);

    return {
      accessToken: accessToken
    }
  },

  logout: async (refreshToken: string) => {

    const oldRefreshToken = await ValidatedToken.findOne({
      token: refreshToken
    })

    if (!oldRefreshToken) {
      throw new Error('Refresh token is wrong');
    }

    const user = await User.findById(oldRefreshToken.userId);

    if (!user) {
      throw new Error("Invalid userId")
    }


    oldRefreshToken.status = ValidatedTokenStatus.REVOKED
    await oldRefreshToken.save();
  },

  cleanUpTokens: async () => {
    await ValidatedToken.deleteMany({
      $or: [
        { status: ValidatedTokenStatus.EXPIRED },
        { status: ValidatedTokenStatus.REVOKED },
        { expiredAt: { $lt: new Date() } }
      ]
    })

  },

  sendOtp: async (email: string) => {
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error("Email is wrong");
    }

    const otp = Math.floor(100000 + Math.random() * 900000)

    await emailService.sendEmail({
      from: "Tranhunghp22112004@gmail.com",
      to: user.email as string,
      subject: "Forgot password",
      text: `Your OTP code is ${otp}`,
      template: 'otp',
      context: { otp }
    })

    await ForgotPassword.create({
      otp,
      userId: user.id,
      expired: new Date(Date.now() + 30 * 1000)
    })

    return otp;
  },

  forgotPassword: async (otp: string, email: string, newPassword: string) => {
    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Email is wrong")
    }

    const oldForgotPassword = await ForgotPassword.findOne({
      userId: user._id,
      otp
    })

    if (!oldForgotPassword) {
      throw new Error("Otp or email is wrong")
    }


    user.password = newPassword;
    await user.save();

    oldForgotPassword.isUsed = true;
    await oldForgotPassword.save();
  },

  cleanUpOtps: async () => {
    await ForgotPassword.deleteMany({
      $or: [
        {
          expiredAt: {
            $lt: new Date()
          }
        },
        {
          isUsed: true
        }
      ]
    })
  },

  updatePassword: async (userId: string, newPassword: string) => {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found")
    }

    user.password = newPassword;
    await user.save();
  }
}
export default authService
