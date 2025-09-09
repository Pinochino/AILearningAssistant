import dotenv from 'dotenv';
import { Request } from 'express';
dotenv.config();
import passport from 'passport';
import { User } from '~/models/User';
import { UserProvider, UserProviderType } from '~/models/UserProvider';
const GoogleStrategy = require('passport-google-oauth2').Strategy;
import crypto from 'crypto';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true,
},
  async function (request: Request, accessToken: string, refreshToken: string, profile: any, done: any) {
    try {

      let oldUserProvider = await UserProvider.findOne({
        providerId: profile.id,
      });

      if (!oldUserProvider) {
        oldUserProvider = await UserProvider.create({
          providerId: profile.id,
          provider: UserProviderType.GOOGLE
        })
      }

      let oldUser = await User.findOne({
        provider: {
          $in:
            [oldUserProvider._id]
        }
      })

      if (!oldUser) {
        oldUser = await User.create({
          username: profile.familyName + " " + profile.givenName,
          email: profile.email,
          avatar: profile.picture,
          password: crypto.randomBytes(32).toString('hex'),
          provider: [oldUserProvider._id]
        })
      }

      
      return done(null, oldUser);
    } catch (error) {
      return done(error, null);
    }
  }
));
passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));

export default passport;
