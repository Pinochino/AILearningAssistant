import dotenv from 'dotenv'
import { Request } from 'express'
dotenv.config()
import passport from 'passport'
import { User } from '../models/User'
import { UserProvider, UserProviderType } from '../models/UserProvider'
const GoogleStrategy = require('passport-google-oauth2').Strategy
import crypto from 'crypto'
import { Role, RoleName } from '../models/Role'
import { Types } from 'mongoose'

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async function (request: Request, accessToken: string, refreshToken: string, profile: any, done: any) {
      try {
        let oldUserProvider = await UserProvider.findOne({
          providerId: profile.id
        })

        if (!oldUserProvider) {
          oldUserProvider = await UserProvider.create({
            providerId: profile.id,
            provider: UserProviderType.GOOGLE
          })
        }

        let oldRole = await Role.findOne({
          name: RoleName.USER
        })

        if (!oldRole) {
          oldRole = await Role.create({
            name: RoleName.USER
          })
        }

        const roles: Types.ObjectId[] = []
        roles.push(oldRole._id as Types.ObjectId)

        let oldUser = await User.findOne({
          provider: {
            $in: [oldUserProvider._id]
          }
        })

        if (!oldUser) {
          oldUser = await User.create({
            username: profile.displayName,
            email: profile.email,
            avatar: profile.picture,
            password: crypto.randomBytes(32).toString('hex'),
            provider: [oldUserProvider._id],
            roles
          })
        }

        return done(null, oldUser)
      } catch (error) {
        return done(error, null)
      }
    }
  )
)
passport.serializeUser((user: any, done) => done(null, user))
passport.deserializeUser((user: any, done) => done(null, user))

export default passport
