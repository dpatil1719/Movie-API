// passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const { User } = require('./models');

const JWTStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    { usernameField: 'Username', passwordField: 'Password' },
    async (username, password, done) => {
      try {
        const user = await User.findOne({ Username: username });
        if (!user) return done(null, false, { message: 'Incorrect username or password.' });
        if (!user.validatePassword(password)) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }
        return done(null, user);
      } catch (e) {
        return done(e);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: process.env.JWT_SECRET || 'dev_only_secret' },
    async (payload, done) => {
      try {
        const user = await User.findById(payload._id);
        return done(null, user || false);
      } catch (e) {
        return done(e, false);
      }
    }
  )
);