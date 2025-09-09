import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import webConfigs from '~/configs/webConfigs'
import routers from '~/routers/routers'
import '~/crons/ValidatedTokenClean'
import '~/crons/ForgotPasswordClean'
import passport from '~/configs/passport';

const app = express();

webConfigs(app);
routers(app);

const PORT = process.env.PORT

app.use(passport.initialize());
// app.use(passport.session());

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`)
})
