const express = require('express'),
      hbs = require('hbs'),
      MongoClient = require('mongodb').MongoClient,
      ObjectID = require('mongodb').ObjectID,
      multer = require('multer'),
      moment = require('moment'),
      port = process.env.PORT || 3000;

var app = express();
let storage = multer.diskStorage({});
let upload = multer({storage});

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

MongoClient.connect(`mongodb://localhost:27017/polls`, (err, db)=>{
  if(err) throw err;

  app.get('/addpoll', (req, res) => {
    res.render('addpoll.hbs');
  });

  app.post('/addpoll', upload.array(), (req, res) => {
      let poll = {
        time: moment().format(),
        pollName: req.body.pollName
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
    let option = {};
    option[req.params.key + '.votes'] = 1;

     db.collection('poll').findOneAndUpdate({'_id': ObjectID(req.params.id)}, {$inc: option});
     res.redirect(`/poll/${req.params.id}`);
  })

  app.get('/poll/:id', (req, res) => {
    db.collection('poll').findOne({'_id': ObjectID(req.params.id)}, {'_id': 0, 'time': 0}, (err, doc) => {
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
    db.collection('poll').findOne({'_id': ObjectID(req.params.id)}, {'_id': 0, 'time': 0, 'pollName': 0}, (err, doc) => {
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
