const express = require('express'),
      routes = require('./routes/routes'),
      hbs = require('hbs'),
      MongoClient = require('mongodb').MongoClient,
      session = require('express-session'),
      parseurl = require('parseurl'),
      flash = require('connect-flash'),
      passport = require('passport'),
      GitHubStrategy = require('passport-github').Strategy,
      port = process.env.PORT || 3000;

passport.use(new GitHubStrategy({
  clientID: process.env.CLIENTID,
  clientSecret: process.env.CLIENTSECRET,
  callbackURL: process.env.CALLBACKURL
  }, (accessToken, refreshToken, profile, cb) => {
    if(profile) {
    user = profile;
    return cb(null, user);
  } else {
    return done(null, false);
    };
  }
));

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((obj, cb) => {
  cb(null, obj);
});

var app = express();

app.set('view engine', 'hbs');

app.use(session({
  secret: process.env.SESSION,
  resave: true,
  saveUnitialized: true
}));
app.use(flash());
app.use((req, res, next) => {

  let views = req.session.views;

  if(!views){
    views = req.session.views = {};
  }
  let pathname = parseurl(req).pathname;
  views[pathname] = (views[pathname] || 0) + 1;

  next();
});
app.use(express.static(__dirname + '/public'));
app.use(passport.initialize());
app.use(passport.session());

MongoClient.connect(`mongodb://${process.env.MONGOUSER}:${process.env.MONGOPASS}@ds064299.mlab.com:64299/polls`, (err, db)=>{
  if(err) throw err;
  routes(app, passport, db);

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});
