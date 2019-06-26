import express, { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import moment from 'moment';

const router: Router = Router();

router
  .route('/')
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userIsCached: boolean = req.user !== undefined;
      const user: string | undefined = userIsCached
        ? req.user._json.name
        : undefined;
      const avatar: string | undefined = userIsCached
        ? req.user._jsion.avatar_url
        : undefined;

      db.collection('poll')
        .find({})
        .sort({ time: 1 })
        .toArray((err, data) => {
          if (err) throw err;

          res.render('allpolls.hbs', { data, user, avatar });
        });
    } catch (error) {
      return next(error);
    }
  });
  
exports.router;