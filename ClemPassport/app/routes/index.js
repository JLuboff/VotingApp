const path = process.cwd();
const ClickHandler = require(path + '/app/controllers/clickHandler.server');


module.exports = (app, passport) => {

  function isLoggedIn (req, res, next) {
    if(req.isAuthenticated()){
      return next();
    } else {
      res.redirect('/login');
    }
  }

  let clickHandler = new ClickHandler();

  app.route('/').get(isLoggedIn, (req,res) => {
    res.sendFile(process.cwd() + '/public/index.html');
  });

  app.route('/login')
    .get((req, res) => {
      res.sendFile(path + '/public/login.html');
    });

  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/login');
    });

  app.route('/profile')
    .get(isLoggedIn, (req, res) => {
      res.sendFile(path + '/public/profile.html');
    });

  app.route('/api/:id')
    .get(isLoggedIn, (req, res) => {
      res.json(req.user.github);
    });

  app.route('/auth/github')
    .get(passport.authenticate('github'));

  app.route('/auth/github/callback')
    .get(passport.authenticate('github', {
      successRedirect: '/',
      failureRedirect: '/login'
    }));

  app.route('/api/:id/clicks')
    .get(isLoggedIn, clickHandler.getClicks)
    .post(isLoggedIn, clickHandler.addClicks)
    .delete(isLoggedIn, clickHandler.resetClicks);

  app.route('/api/clicks')
  .get(clickHandler.getClicks)
  .post(clickHandler.addClicks)
  .delete(clickHandler.resetClicks);
};
