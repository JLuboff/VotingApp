const express = require('express'),
      passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy;

var app = express();


  app.use(express.static('public'));
  //app.use(express.cookieParser());
  //app.use(express.bodyParser());
  //app.use(express.session({secret: 'Super Strong Secret'}));
  app.use(passport.initialize());
  app.use(passport.session());
  //app.use(app.router);


passport.use(new LocalStrategy(
  (username, password, done) => {
    User.findOne( {username}, (err, user) => {
      if(err) return done(err);
      if(!user) {
        return done(null, false, {message: 'Incorrect username.'})
      }
      if(!user.validPassword(password)) {
        return done(null, false, {message: 'Incorrect password.'})
      }
      return done(null, user);
    });
  }
));

app.get('/', (req, res) => {
  res.send("Successful Authenication");
})

app.get('/login', (reg, res) => {
  res.redirect('index.html');
})

app.post('/login', passport.authenticate('local', {successRedirect: '/', failureRedirect: '/login'}))

app.listen(3000);
