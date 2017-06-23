function clickHandler(db)  {
  let clicks = db.collection('clicks');

  this.addClicks = (req, res) => {
    clicks.findAndModify({}, {'_id': 1}, {$inc: {'clicks': 1}}, (err, result) => {
      if(err) throw err;

      res.json(result);
    });
  };

  this.resetClicks = (req, res) => {
    clicks.update({}, {'clicks': 0}, (err, result) => {
      if(err) throw err;

      res.json(result);
    });
  };

  this.getClicks = (req,res) => {
    let clickProjection = {'_id': false};

    clicks.findOne({}, clickProjection, (err, result) => {
      if(err) throw err;
      if(result){
        res.json(result);
      } else {
        clicks.insert({'clicks': 0}, err => {
          if(err) throw err;
        })
        clicks.findOne({}, clickProjection, (err, doc) => {
          if(err) throw err;

          res.json(doc);
        });
      };
    });
  }
}

module.exports = clickHandler;
