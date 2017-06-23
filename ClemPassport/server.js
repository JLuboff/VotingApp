const express = require('express');
const port = process.env.PORT || 3000;
const routes = require('./app/routes/index');
const mongo = require('mongodb').MongoClient;

var app = express();

mongo.connect('mongodb://localhost:27017/clementinejs', (err, db) => {

  if(err) throw new Error('Database failed to connect!');
  else console.log('MongoDB successfully connected to port 27017');

  app.use('/public', express.static(process.cwd() + '/public'));
  app.use('/controllers', express.static(process.cwd() + '/app/controllers'));

  routes(app, db);

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });

});
