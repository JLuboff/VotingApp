"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const v4_1 = __importDefault(require("uuid/v4"));
const routes_1 = __importDefault(require("./routes/routes"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_github_1 = require("passport-github");
const parseurl_1 = __importDefault(require("parseurl"));
const port = process.env.PORT || 3004;
const app = express_1.default();
const corsOptions = {
    origin: "http://localhost:3000",
    optionsSuccessStatus: 200,
    credentials: true
};
const passportConfig = {
    clientID: process.env.CLIENTID,
    clientSecret: process.env.CLIENTSECRET,
    callbackURL: process.env.CALLBACKURL
};
passport_1.default.use(new passport_github_1.Strategy(passportConfig, (accessToken, refreshToken, profile, cb) => {
    if (profile) {
        const user = profile;
        return cb(null, user);
    }
    else {
        return done(null, false);
    }
}));
passport_1.default.serializeUser((user, cb) => {
    cb(null, user);
});
passport_1.default.deserializeUser((obj, cb) => {
    cb(null, obj);
});
app.use(compression_1.default());
app.use(cors_1.default(corsOptions));
app.use(express_session_1.default({
    genid: () => v4_1.default(),
    secret: process.env.SESSION,
    resave: false,
    saveUninitialized: false,
    name: "votingApp"
}));
app.use((req, res, next) => {
    let views = req.session.views;
    if (!views) {
        views = req.session.views = {};
    }
    const pathname = parseurl_1.default(req).pathname;
    views[pathname] = (views[pathname] || 0) + 1;
    next();
});
app.use(express_1.default.static(__dirname + "/public"));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use(express_1.default.static("public"));
app.use(express_1.default.static("build"));
app.use(routes_1.default);
process.on("uncaughtException", err => {
    console.error(err.stack);
});
process.on("unhandledRejection", err => {
    console.log(err);
});
app.listen(port, () => {
    console.log(`Listening on Port: ${port} in ${process.env.NODE_ENV} mode.`);
});
