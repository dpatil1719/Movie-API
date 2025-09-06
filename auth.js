// auth.js
const jwt = require('jsonwebtoken');
const passport = require('passport');

const jwtSecret = process.env.JWT_SECRET || 'dev_only_secret';

// helper: sign a JWT for the authenticated user
function generateJWTToken(user) {
  return jwt.sign(
    { _id: user._id, Username: user.Username },
    jwtSecret,
    { subject: user.Username, expiresIn: '7d', algorithm: 'HS256' }
  );
}

module.exports = (app) => {
  // Normalize creds from query OR body into req.body.Username/Password
  const pullCreds = (req, _res, next) => {
    req.body = req.body || {};
    req.body.Username =
      req.body.Username ?? req.query.Username ?? req.body.username ?? req.query.username;
    req.body.Password =
      req.body.Password ?? req.query.Password ?? req.body.password ?? req.query.password;
    next();
  };

  // Use the custom-callback form so we can send clean errors (no throws)
  app.post('/login', pullCreds, (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Login error' });
      }
      if (!user) {
        // incorrect username OR password
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      const token = generateJWTToken(user.toJSON());
      return res.json({ user, token });
    })(req, res, next);
  });
};