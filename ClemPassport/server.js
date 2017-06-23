const express = require('express');
const port = process.env.PORT || 8080;
const routes = require('./app/routes/index');
const mongoose = require('mongoose');

var app = express();

mongoose.connect('mongodb://localhost:27017/clementinejs');


  app.use('/public', express.static(process.cwd() + '/public'));
  app.use('/controllers', express.static(process.cwd() + '/app/controllers'));

  routes(app);

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
