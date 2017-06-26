const Clicks = require('../models/users');

function ClickHandler()  {

  this.addClicks = (req, res) => {
    Clicks.findOneAndUpdate({'github.id': req.user.github.id}, {$inc: {'nbrClicks.clicks': 1}})
    .exec((err, result) => {
      if(err) throw err;

      res.json(result.nbrClicks);
    });
  };

  this.resetClicks = (req, res) => {
    Clicks.findOneAndUpdate({'github.id': req.user.github.id}, {'nbrClicks.clicks': 0})
    .exec((err, result) => {
      if(err) throw err;

      res.json(result);
    });
  };

  this.getClicks = (req,res) => {

    Clicks.findOne({'github.id': req.user.github.id}, {'_id': 0})
    .exec((err, result) => {
      if(err) throw err;

        res.json(result.nbrClicks);

    });
  };
}

module.exports = ClickHandler;
