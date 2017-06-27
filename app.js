const express = require('express'),
      hbs = require('hbs'),
      MongoClient = require('mongodb').MongoClient,
      ObjectID = require('mongodb').ObjectID,
      multer = require('multer'),
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
      console.log(req.body);
      db.collection('poll').insert(req.body, (err, doc) => {
        if(err) throw err;
res.redirect(`/poll/${doc.ops[0]._id}`);
      });


  });

  app.get('/poll/:id', (req, res) => {
console.log(req.params.id);
    db.collection('poll').findOne({'_id': ObjectID(req.params.id)}, {'_id': 0}, (err, doc) => {
      if (err) throw err;

      res.send(JSON.stringify(doc));
    })
  })

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
});
