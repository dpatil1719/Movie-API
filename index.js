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
const JWT_SECRET = 'myflix_secret_key';

/* ===== CORS ===== */
const allowedOrigins = [
  'http://localhost:4200',
  'https://dpatil1719.github.io'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('CORS not allowed'));
    }
  })
);

app.use(bodyParser.json());
app.use(morgan('common'));

/* ===== MONGODB (EXPLICIT + SAFE) ===== */
const mongoUri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myFlixDB';

console.log('Connecting to MongoDB…');

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');

    /* ===== START SERVER ONLY AFTER DB CONNECTS ===== */
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

/* ===== ROUTES ===== */

app.post('/users', async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.Password, 10);
    const newUser = new Users({
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    });
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err);
  }
});

app.post('/login', async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.body.username });
    if (!user) return res.status(400).send('User not found');

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.Password
    );
    if (!validPassword) return res.status(400).send('Invalid password');

    const token = jwt.sign(
      { Username: user.Username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed');
  }
});

app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find();
      res.json(movies);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);
