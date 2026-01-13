const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');

require('./passport');

const Models = require('./models');
const Users = Models.User;
const Movies = Models.Movie;

const app = express();
app.use(passport.initialize());

/* ===== CORS (FIXED FOR ANGULAR + RENDER) ===== */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());

/* ===== MIDDLEWARE ===== */
app.use(bodyParser.json());
app.use(morgan('common'));

/* ===== HEALTH CHECK ===== */
app.get('/', (req, res) => {
  res.send('myFlix API is running ✅');
});

/* ===== MONGODB ===== */
const mongoUri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myFlixDB';

console.log('Connecting to MongoDB…');

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

/* ===== AUTH ===== */
app.post('/login', async (req, res) => {
  const user = await Users.findOne({ Username: req.body.username });
  if (!user) return res.status(400).send('User not found');

  const valid = await bcrypt.compare(req.body.password, user.Password);
  if (!valid) return res.status(400).send('Invalid password');

  const token = jwt.sign(
    { Username: user.Username },
    process.env.JWT_SECRET || 'myflix_secret_key',
    { expiresIn: '7d' }
  );

  res.json({ user, token });
});

/* ===== MOVIES ===== */
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const movies = await Movies.find();
    res.json(movies);
  }
);

