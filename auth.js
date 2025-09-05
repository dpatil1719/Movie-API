// auth.js
const jwtSecret = 'your_jwt_secret'; // must match passport.js
const jwt = require('jsonwebtoken');
const passport = require('passport');
const jwtSecret = process.env.JWT_SECRET || 'dev_only_secret';

require('./passport'); // register Local & JWT strategies

const generateJWTToken = (user) => {
  // sign only what you need in the token
  return jwt.sign(
    { _id: user._id, Username: user.Username },
    jwtSecret,
    { expiresIn: '7d', algorithm: 'HS256' }
  );
};

module.exports = (app) => {
  app.post('/login', (req, res, next) => {
    // Allow credentials via Params or Body (handy for Postman)
    req.body.Username =
      req.body.Username || req.query.Username || req.query.username;
    req.body.Password =
      req.body.Password || req.query.Password || req.query.password;

    // ✅ correct method name: authenticate (not authentication)
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error) return next(error);
      if (!user) {
        return res.status(400).json(info || { message: 'Incorrect username or password.' });
      }

      req.login(user, { session: false }, (err) => {
        if (err) return next(err);
        const token = generateJWTToken(user.toJSON ? user.toJSON() : user);
        return res.json({ user, token });
      });
    })(req, res, next);
  });
};