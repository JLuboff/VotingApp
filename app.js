const express = require('express'),
hbs = require('hbs'),
MongoClient = require('mongodb').MongoClient,
ObjectID = require('mongodb').ObjectID,
multer = require('multer'),
moment = require('moment'),
//  session = require('express-session'),
parseurl = require('parseurl'),
port = process.env.PORT || 3000;

var app = express();
let storage = multer.diskStorage({});
let upload = multer({storage});

app.set('view engine', 'hbs');
/*app.use(session({
secret: 'potato',
resave: false,
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

}); */
app.use(express.static(__dirname + '/public'));
MongoClient.connect(`mongodb://${process.env.MONGOUSER}:${process.env.MONGOPASS}@ds064299.mlab.com:64299/polls`, (err, db)=>{
  if(err) throw err;

  app.get('/addpoll', (req, res) => {
    res.render('addpoll.hbs');
  });

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
    console.log(req.headers);

    /*if(Object.keys(req.session.views).filter(el => el.includes(url.slice(0,37))).length > 1 || req.session.views[url] > 1){

      return res.redirect(`/poll/${req.params.id}`);
    } */

    let option = {};
    option[req.params.key + '.votes'] = 1;
    console.log(option);
    db.collection('poll').findOneAndUpdate({'_id': ObjectID(req.params.id)}, {$inc: option, {$push: {ipAddresses: req.headers['x-forwarded-for']}});
    res.redirect(`/poll/${req.params.id}`);
  })

  app.get('/poll/:id', (req, res) => {

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

      res.render('viewpoll.hbs', {pollName, options, id});
    })
  })

  app.get('/', (req, res) => {
    db.collection('poll').find({}).sort({time: 1}).toArray((err, data) => {
      if(err) throw err;
      res.render('allpolls.hbs', {data});
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
