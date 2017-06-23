const ClickHandler = require(process.cwd() + '/app/controllers/clickHandler.server');

module.exports = (app, db) => {

  let clickHandler = new ClickHandler(db);
  app.route('/').get((req,res) => {
    res.sendFile(process.cwd() + '/public/index.html');
  });

  app.route('/api/clicks')
  .get(clickHandler.getClicks)
  .post(clickHandler.addClicks)
  .delete(clickHandler.resetClicks);
};
