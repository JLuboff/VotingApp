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
  //clientID: process.env.CLIENTID,
  //clientSecret: process.env.CLIENTSECRET,
  //callbackURL: process.env.CALLBACKURL
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
MongoClient.connect('mongodb://localhost:27017/polls', (err, db) => {
//MongoClient.connect(`mongodb://${process.env.MONGOUSER}:${process.env.MONGOPASS}@ds064299.mlab.com:64299/polls`, (err, db)=>{

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
      creator: req.user.id
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

    if(Object.keys(req.session.views).filter(el => el.includes(url.slice(0,37))).length > 1 || req.session.views[url] > 1){

      return res.redirect(`/poll/${req.params.id}`);
    }

    let option = {};
    option[req.params.key + '.votes'] = 1;

    db.collection('poll').findOneAndUpdate({'_id': ObjectID(req.params.id)}, {$inc: option});
    res.redirect(`/poll/${req.params.id}`);
  })

  app.post('/addoption/:id', isLogged, upload.array(), (req, res) => {
  var user, avatar;
  if(req.user !== undefined){ console.log(`Not undefined: ${req.user._json.name}`);
  user = req.user._json.name;
  avatar = req.user._json.avatar_url;};
  let optionName = req.body.userAdded;

  db.collection('poll').findOne({'_id': ObjectID(req.params.id)}, {'_id': 0, 'time': 0, 'creator': 0}, (err, doc) => {
    if (err) throw err;

    let pollName = doc.pollName;
    let id = req.params.id;
    let options = {};

    for(let i in doc){
      if(i !== 'pollName'){
        options[i] = doc[i]
      }
    };

    let optionsArray = Object.keys(options);

    let opNum = Number(optionsArray[optionsArray.length - 1].slice(-1)) + 1;

    let newOption = 'option' + opNum;
    let insert = {[newOption]: {votes: 0, optionName: optionName}};

    db.collection('poll').findOneAndUpdate({'_id': ObjectID(req.params.id)},{$set: insert});

    res.redirect(`/poll/${req.params.id}`);
  })
})

  app.get('/poll/:id', (req, res) => {
    var user, avatar;
    if(req.user !== undefined){ console.log(`Not undefined: ${req.user._json.name}`);
    user = req.user._json.name;
    avatar = req.user._json.avatar_url;};

    db.collection('poll').findOne({'_id': ObjectID(req.params.id)}, {'_id': 0, 'time': 0, 'creator': 0}, (err, doc) => {
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

  app.get('/deletepoll/:id', (req,res) => {
    db.collection('poll').remove({'_id': ObjectID(req.params.id)});
   res.redirect('/createdpolls');
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
    db.collection('poll').findOne({'_id': ObjectID(req.params.id)}, {'_id': 0, 'time': 0, 'pollName': 0, 'ipAddresses': 0, 'creator': 0}, (err, doc) => {
      if(err) throw err;

      res.setHeader('Content-Type', 'application/json');
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

      res.send(doc);
    })
  })

  app.get('/createdpolls', isLogged, (req, res) => {

    let user = req.user._json.name;
    let avatar = req.user._json.avatar_url;
    let id = req.user.id;
    console.log(id);
    db.collection('poll').find({creator: id}).toArray((err, data) => {
      if(err) throw err;

      res.render('createdpolls.hbs', {data, user, avatar});
    })
  })

  app.get('/profile', isLogged, (req, res) => {
    var user, avatar;
    user = req.user._json.name;
    avatar = req.user._json.avatar_url;
    let id = req.user.id;

    db.collection('poll').find({creator: id}).toArray((err, doc) => {
      if(err) throw err;
      let pollCount = doc.length
      let repos = req.user._json.public_repos;
      let followers = req.user._json.followers;

    res.render('profile.hbs', {user, avatar, pollCount, repos, followers});

});
  })

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});
