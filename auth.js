// auth.js
const jwt = require('jsonwebtoken');
const passport = require('passport');

const jwtSecret = process.env.JWT_SECRET || 'dev_only_secret';

module.exports = (app) => {
  app.post('/login', (req, res, next) => {
    // accept creds from query OR body (any casing)
    const Username =
      req.body?.Username ?? req.query?.Username ?? req.body?.username ?? req.query?.username;
    const Password =
      req.body?.Password ?? req.query?.Password ?? req.body?.password ?? req.query?.password;

    if (!Username || !Password) {
      return res.status(400).json({ message: 'Username and Password are required' });
    }

    // normalize so LocalStrategy (Username/Password) can read them
    req.body.Username = Username;
    req.body.Password = Password;

    // custom callback -> we handle success/failure explicitly (no crash)
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Login error' });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }

      const token = jwt.sign(
        { _id: user._id, Username: user.Username },
        jwtSecret,
        { subject: user.Username, expiresIn: '7d', algorithm: 'HS256' }
      );

      return res.json({ user, token });
    })(req, res, next);
  });
};