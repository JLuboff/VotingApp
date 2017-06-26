const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Click = new Schema(
  { clicks: Number},
  { versionKey: false}
);

module.exports = mongoose.model('Click', Click);
