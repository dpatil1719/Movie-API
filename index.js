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

const JWT_SECRET = process.env.JWT_SECRET || 'myflix_secret_key';

/* ===== CORS ===== */
/* Allow your local dev + GitHub Pages + Render frontend if needed */
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:8080',
  'https://dpatil1719.github.io'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (Postman/curl, mobile apps)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, true); // keep permissive for tutor testing
    }
  })
);

/* ===== MIDDLEWARE ===== */
app.use(bodyParser.json());
app.use(morgan('common'));

/* ===== HEALTH ROUTE ===== */
app.get('/', (req, res) => {
  res.send('myFlix API is running ✅');
});

/* ===== ROUTES ===== */

// Register
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

// Login
app.post('/login', async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.body.username });
    if (!user) return res.status(400).send('User not found');

    const validPassword = await bcrypt.compare(req.body.password, user.Password);
    if (!validPassword) return res.status(400).send('Invalid password');

    const token = jwt.sign({ Username: user.Username }, JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed');
  }
});

// Get user (JWT protected)
app.get(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const user = await Users.findOne({ Username: req.user.Username }).select(
        '-Password'
      );
      if (!user) return res.status(404).send('User not found.');
      return res.json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);

// Get all movies (JWT protected)
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find();
      res.status(200).json(movies);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// Update user (JWT protected)
app.put(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.user.Username },
        {
          $set: {
            ...(req.body.Username !== undefined && { Username: req.body.Username }),
            ...(req.body.Password !== undefined && {
              Password: bcrypt.hashSync(req.body.Password, 10)
            }),
            ...(req.body.Email !== undefined && { Email: req.body.Email }),
            ...(req.body.Birthday !== undefined && { Birthday: req.body.Birthday })
          }
        },
        { new: true }
      );

      if (!updatedUser) return res.status(404).send('User not found.');
      return res.json(updatedUser);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);

// Favorites add
app.post(
  '/users/:username/movies/:movieId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const username = req.user.Username;
      const movieId = req.params.movieId;

      const updatedUser = await Users.findOneAndUpdate(
        { Username: username },
        { $addToSet: { FavoriteMovies: movieId } },
        { new: true }
      );

      if (!updatedUser) return res.status(404).send('User not found.');
      return res.json(updatedUser);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);

// Favorites remove
app.delete(
  '/users/:username/movies/:movieId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const username = req.user.Username;
      const movieId = req.params.movieId;

      const updatedUser = await Users.findOneAndUpdate(
        { Username: username },
        { $pull: { FavoriteMovies: movieId } },
        { new: true }
      );

      if (!updatedUser) return res.status(404).send('User not found.');
      return res.json(updatedUser);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);

/* ===== CONNECT DB THEN START SERVER ===== */
const mongoUri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myFlixDB';

const PORT = process.env.PORT || 3000;

console.log('Connecting to MongoDB…');

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
