// auth.js
const jwt = require('jsonwebtoken');
const passport = require('passport');

const jwtSecret = process.env.JWT_SECRET || 'dev_only_secret'; // declare ONCE

require('./passport'); // register strategies

function generateJWTToken(user) {
  return jwt.sign(
    { _id: user._id, Username: user.Username },
    jwtSecret,
    { subject: user.Username, expiresIn: '7d', algorithm: 'HS256' }
  );
}

module.exports = (app) => {
  // allow Username/Password via body OR query params (for Postman "Params" tab)
  app.post(
    '/login',
    (req, _res, next) => {
      req.body.Username = req.body.Username || req.query.Username || req.body.username || req.query.username;
      req.body.Password = req.body.Password || req.query.Password || req.body.password || req.query.password;
      next();
    },
    passport.authenticate('local', { session: false }),
    (req, res) => {
      const token = generateJWTToken(req.user.toJSON());
      res.json({ user: req.user, token });
    }
  );
};