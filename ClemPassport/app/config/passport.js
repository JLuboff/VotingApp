const GitHubStrategy = require('passport-github').Strategy,
      User = require('../models/users'),
      configAuth = require('./auth');

module.exports = passport => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(new GitHubStrategy({
    clientID: configAuth.githubAuth.clientID,
    clientSecret: configAuth.githubAuth.clientSecret,
    callbackURL: configAuth.githubAuth.callbackURL
  }, (token, refreshToken, profile, done) => {
    process.nextTick(()=>{
      User.findOne({'github.id': profile.id}, (err, user) =>{
        if(err) return done(err);
        if(user){ return done(null, user)
        } else {
          let newUser = new User();

          newUser.github.id = profile.id;
          newUser.github.username = profile.username;
          newUser.github.displayName = profile.displayName;
          newUser.github.publicRepos = profile._json.public_repos;
          newUser.nbrClicks.click = 0;

          newUser.save(err => {
            if(err) throw err;

            return done(null, newUser);
          });
        }
      });
    });
  }));
};
