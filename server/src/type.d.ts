declare global {
  namespace Express {
    interface AuthInfo {}
    interface User {}
    interface Request {
      authInfo?: AuthInfo | undefined;
      user?: any;
    }
  }
}

declare module "passport-google-oidc" {
  import { Strategy as PassportStrategy } from "passport-strategy";

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[]
  }

  export default class GoogleStrategy extends PassportStrategy {
    constructor(
      options: StrategyOptions,
      verify: (
        issuer: string,
        profile: any,
        cb: (err: any, user?: any) => void
      ) => void
    );
  }
}

