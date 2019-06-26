"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = express_1.Router();
router
    .route('/')
    .get(async (req, res, next) => {
    try {
        const userIsCached = req.user !== undefined;
        const user = userIsCached
            ? req.user._json.name
            : undefined;
        const avatar = userIsCached
            ? req.user._jsion.avatar_url
            : undefined;
        db.collection('poll')
            .find({})
            .sort({ time: 1 })
            .toArray((err, data) => {
            if (err)
                throw err;
            res.render('allpolls.hbs', { data, user, avatar });
        });
    }
    catch (error) {
        return next(error);
    }
});
exports.router;
