const express = require('express'),
port = process.env.PORT || 8080,
routes = require('./app/routes/index'),
mongoose = require('mongoose'),
passport = require('passport'),
session = require('express-session');

var app = express();
require('dotenv').load();
require('./app/config/passport')(passport);

mongoose.connect('mongodb://localhost:27017/clementinejs');


app.use('/public', express.static(process.cwd() + '/public'));
app.use('/controllers', express.static(process.cwd() + '/app/controllers'));
app.use('/common', express.static(process.cwd() + '/app/common'));

app.use(session({
  secret: 'secretClementine',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

routes(app, passport);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
