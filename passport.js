// passport.js
const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt');
const { User } = require('./models.js');

// Local (username/password) login
passport.use(
  new LocalStrategy(
    { usernameField: 'Username', passwordField: 'Password' },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ Username: username });
        if (!user) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }
        if (!user.validatePassword(password)) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT auth for protected routes
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'dev_only_secret',
      algorithms: ['HS256'],
      ignoreExpiration: false
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload._id);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

module.exports = passport;