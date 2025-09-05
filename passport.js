// passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const { User: Users } = require('./models');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// Use same secret as auth.js
const jwtSecret = process.env.JWT_SECRET || 'dev_only_secret';

// Local username/password strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
      session: false
    },
    async (username, password, done) => {
      try {
        const user = await Users.findOne({ Username: username });
        if (!user) {
          return done(null, false, { message: 'Incorrect username or password.' });
        }
        if (!user.validatePassword(password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// JWT strategy
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret
    },
    async (jwtPayload, done) => {
      try {
        const user = await Users.findById(jwtPayload._id);
        if (!user) return done(null, false);
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    }
  )
);

module.exports = passport;