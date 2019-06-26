import compression from "compression";
import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import uuidv4 from "uuid/v4";
import routes from "./routes/routes";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-github";
import parseurl from "parseurl";
import { _StrategyOptionsBase } from "passport-oauth2";

const port: string | number = process.env.PORT || 3004;
const app: Application = express();
const corsOptions: CorsOptions = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
  credentials: true
};
const passportConfig : _StrategyOptionsBase = {
  clientID: process.env.CLIENTID!,
  clientSecret: process.env.CLIENTSECRET!,
  callbackURL: process.env.CALLBACKURL
}
passport.use(
  new Strategy(passportConfig,
    (accessToken, refreshToken, profile, cb) => {
      if (profile) {
        const user = profile;
        return cb(null, user);
      } else {
        return done(null, false);
      }
    }
  )
);
passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});
app.use(compression());
app.use(cors(corsOptions));
app.use(
  session({
    genid: () => uuidv4(),
    secret: process.env.SESSION,
    resave: false,
    saveUninitialized: false,
    name: "votingApp"
  })
);
app.use((req, res, next) => {
  let views = req.session!.views;

  if (!views) {
    views = req.session!.views = {};
  }
  const pathname = parseurl(req).pathname;
  views[pathname] = (views[pathname] || 0) + 1;

  next();
});
app.use(express.static(__dirname + "/public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
app.use(express.static("build"));
app.use(routes);

process.on("uncaughtException", err => {
  console.error(err.stack);
});
process.on("unhandledRejection", err => {
  console.log(err);
});

app.listen(port, () => {
  console.log(`Listening on Port: ${port} in ${process.env.NODE_ENV} mode.`);
});
