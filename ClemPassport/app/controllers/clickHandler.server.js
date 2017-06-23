const Clicks = require('../models/clicks');

function ClickHandler()  {

  this.addClicks = (req, res) => {
    Clicks.findOneAndUpdate({}, {$inc: {'clicks': 1}})
    .exec((err, result) => {
      if(err) throw err;

      res.json(result);
    });
  };

  this.resetClicks = (req, res) => {
    Clicks.findOneAndUpdate({}, {'clicks': 0})
    .exec((err, result) => {
      if(err) throw err;

      res.json(result);
    });
  };

  this.getClicks = (req,res) => {

    Clicks.findOne({}, {'_id': 0})
    .exec((err, result) => {
      if(err) throw err;
      if(result){
        res.json(result);
      } else {
        let newDoc = new Clicks({ 'clicks': 0});
        newDoc.save((err, doc)=> {
          if(err) throw err;

          res,json(doc);

        });
      }
    });
  };
}

module.exports = ClickHandler;
