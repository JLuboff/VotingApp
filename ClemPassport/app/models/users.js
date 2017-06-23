const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let User = new Schema({
  github: {
    id: String,
    displayName: String,
    username: String,
    publicRepos: Number
  },
  nbrClicks: {
    clicks: Number
  }
});

module.exports = mongoose.model('User', User);
