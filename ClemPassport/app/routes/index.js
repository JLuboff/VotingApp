const path = process.cwd();
const ClickHandler = require(path + '/app/controllers/clickHandler.server');

module.exports = app => {

  let clickHandler = new ClickHandler();
  app.route('/').get((req,res) => {
    res.sendFile(process.cwd() + '/public/index.html');
  });

  app.route('/api/clicks')
  .get(clickHandler.getClicks)
  .post(clickHandler.addClicks)
  .delete(clickHandler.resetClicks);
};
