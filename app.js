const express = require('express'),
hbs = require('hbs'),
MongoClient = require('mongodb').MongoClient,
ObjectID = require('mongodb').ObjectID,
multer = require('multer'),
moment = require('moment'),
session = require('express-session'),
parseurl = require('parseurl'),
passport = require('passport'),
GitHubStrategy = require('passport-github').Strategy,
port = process.env.PORT || 3000;



passport.use(new GitHubStrategy({
  clientID: '77fa317a2ef081047413',
  clientSecret: '3980498d72be0703a56587dddbe65da702457631',
  callbackURL: 'http://127.0.0.1:3000/auth/github/callback'
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
let storage = multer.diskStorage({});
let upload = multer({storage});

app.set('view engine', 'hbs');

app.use(session({
secret: 'potato',
resave: true,
saveUnitialized: true
}));
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

const isLogged = (req, res, next) => {
  if(req.isAuthenticated()){
    console.log(`User is authenticated`);
    return next();
  }
  console.log(`User is not authenticated`);
return res.redirect('/login');
};

MongoClient.connect(`mongodb://localhost:27017/polls`, (err, db)=>{
  if(err) throw err;

  app.get('/addpoll', isLogged, (req, res) => {
    var user, avatar;
    if(req.user !== undefined){ console.log(`Not undefined: ${req.user._json.name}`);
    user = req.user._json.name;
    avatar = req.user._json.avatar_url;};
    res.render('addpoll.hbs', {user, avatar});
  });

  app.get('/logout', (req,res) => {
    req.logout();
    res.redirect('/');
  });

  app.get('/login', passport.authenticate('github'));

  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/'}),(req, res) =>{
    res.redirect('/');
  })

  app.post('/addpoll', upload.array(), (req, res) => {
    let poll = {
      time: moment().format(),
      pollName: req.body.pollName,
      ipAddresses: []
    }

    for(let i in req.body){
      if(i !== 'pollName'){
        poll[i] = {
          votes: 0,
          optionName: req.body[i]
        }
      }
    };

    db.collection('poll').insert(poll, (err, doc) => {
      if(err) throw err;
      res.redirect(`/poll/${doc.ops[0]._id}`);
    });
  });

  app.get('/poll/voted/:id/:key', (req, res) => {
    let url = parseurl(req).pathname;
    /*  req.session.views = Object.keys(req.session.views).filter(el => !el.includes('/css/style.css'));
    db.collection('sessions').insertMany(req.session.views); */

    //Use $match if I can get into database

    if(Object.keys(req.session.views).filter(el => el.includes(url.slice(0,37))).length > 1 || req.session.views[url] > 1){

      return res.redirect(`/poll/${req.params.id}`);
    }

    let option = {};
    option[req.params.key + '.votes'] = 1;

    /*  db.collection('poll').findOne({'_id': ObjectID(req.params.id), 'ipAddresses': {$in: [req.headers['x-forwarded-for']]}}, (err, doc) =>{
    if(doc) {
    res.redirect(`/poll/${req.params.id}`);
  }
}) */
db.collection('poll').findOneAndUpdate({'_id': ObjectID(req.params.id)}, {$inc: option});
    //  db.collection('poll').findOneAndUpdate({'_id': ObjectID(req.params.id)}, {$addToSet: {ipAddresses: req.headers['x-forwarded-for']}});
    res.redirect(`/poll/${req.params.id}`);
})

  app.get('/poll/:id', (req, res) => {
    var user, avatar;
    if(req.user !== undefined){ console.log(`Not undefined: ${req.user._json.name}`);
    user = req.user._json.name;
    avatar = req.user._json.avatar_url;};

    db.collection('poll').findOne({'_id': ObjectID(req.params.id)}, {'_id': 0, 'time': 0, 'ipAddresses': 0}, (err, doc) => {
      if (err) throw err;

      let pollName = doc.pollName;
      let id = req.params.id;
      let options = {};

      for(let i in doc){
        if(i !== 'pollName'){
          options[i] = doc[i]
        }
      };

      res.render('viewpoll.hbs', {pollName, options, id, user, avatar});
    })
  })

  app.get('/', (req, res) => {
    console.log(req.user);
    var user, avatar;
    if(req.user !== undefined){ console.log(`Not undefined: ${req.user._json.name}`);
    user = req.user._json.name;
    avatar = req.user._json.avatar_url;};
    //console.log(user);
    db.collection('poll').find({}).sort({time: 1}).toArray((err, data) => {
      if(err) throw err;
      res.render('allpolls.hbs', {data, user, avatar});
    })
  });

  app.get('/voteResults/:id', (req, res) => {
    db.collection('poll').findOne({'_id': ObjectID(req.params.id)}, {'_id': 0, 'time': 0, 'pollName': 0, 'ipAddresses': 0}, (err, doc) => {
      if(err) throw err;

      res.setHeader('Content-Type', 'application/json');
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

      res.send(doc);
    })
  })

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});
