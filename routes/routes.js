const multer = require('multer'),
      ObjectID = require('mongodb').ObjectID,
      parseurl = require('parseurl'),
      moment = require('moment');
let storage = multer.diskStorage({});
let upload = multer({storage});

module.exports = (app, passport, db) => {

  const isLogged = (req, res, next) => {
    if(req.isAuthenticated()){
      return next();
    }
    return res.redirect('/login');
  };

  app.route('/')
  .get((req, res) => {
    var user, avatar;
    if(req.user !== undefined){
    user = req.user._json.name;
    avatar = req.user._json.avatar_url;};

    db.collection('poll').find({}).sort({time: 1}).toArray((err, data) => {
      if(err) throw err;
      res.render('allpolls.hbs', {data, user, avatar});
    })
  });

  app.route('/addoption/:id')
  .post(isLogged, upload.array(), (req, res) => {
    var user, avatar;
    user = req.user._json.name;
    avatar = req.user._json.avatar_url;
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
  });

  app.route('/addpoll')
  .get(isLogged, (req, res) => {
    var user, avatar;
    if(req.user !== undefined){
    user = req.user._json.name;
    avatar = req.user._json.avatar_url;};
    res.render('addpoll.hbs', {user, avatar});
  })
  .post(upload.array(), (req, res) => {
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

  app.route('/auth/github/callback')
  .get(passport.authenticate('github', { failureRedirect: '/'}),(req, res) =>{
    res.redirect('/');
  });

  app.route('/createdpolls')
  .get(isLogged, (req, res) => {

    let user = req.user._json.name;
    let avatar = req.user._json.avatar_url;
    let id = req.user.id;

    db.collection('poll').find({creator: id}).toArray((err, data) => {
      if(err) throw err;
      res.render('createdpolls.hbs', {data, user, avatar});
    })
  });

  app.route('/deletepoll/:id')
  .get((req,res) => {
    db.collection('poll').remove({'_id': ObjectID(req.params.id)});
    res.redirect('/createdpolls');
  });

  app.route('/login')
  .get(passport.authenticate('github'));

  app.route('/logout')
  .get((req,res) => {
    req.logout();
    res.redirect('/');
  });

  app.route('/poll/:id')
  .get((req, res) => {
    var user, avatar;
    if(req.user !== undefined){
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
  });

  app.route('/poll/voted/:id/:key')
  .get((req, res) => {
    let url = parseurl(req).pathname;

    if(Object.keys(req.session.views).filter(el => el.includes(url.slice(0,37))).length > 1 || req.session.views[url] > 1){

      return res.redirect(`/poll/${req.params.id}`);
    }

    let option = {};
    option[req.params.key + '.votes'] = 1;

    db.collection('poll').findOneAndUpdate({'_id': ObjectID(req.params.id)}, {$inc: option});
    res.redirect(`/poll/${req.params.id}`);
  });

  app.route('/profile')
  .get(isLogged, (req, res) => {
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
  });

  app.route('/voteResults/:id')
  .get((req, res) => {
    db.collection('poll').findOne({'_id': ObjectID(req.params.id)}, {'_id': 0, 'time': 0, 'pollName': 0, 'ipAddresses': 0, 'creator': 0}, (err, doc) => {
      if(err) throw err;

      res.setHeader('Content-Type', 'application/json');
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.send(doc);
    })
  });

};
