const passport = require('passport');
const passportJWT = require('passport-jwt');
const Models = require('./models');

const Users = Models.User;
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'myflix_secret_key'
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      // ✅ Your token signs: { Username: user.Username }
      const user = await Users.findOne({ Username: jwt_payload.Username });
      return user ? done(null, user) : done(null, false);
    } catch (err) {
      return done(err, false);
    }
  })
);
