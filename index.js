// index.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const { check, validationResult } = require('express-validator');

const { Movie: Movies, User: Users } = require('./models.js');

// --- DB CONNECTION ---
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cfDB');


// --- APP SETUP ---
const app = express();

// CORS (define allowed front-end origins here)
const allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // allow tools like Postman
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          'The CORS policy for this application doesn’t allow access from origin ' +
          origin;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- PASSPORT (order matters) ---
require('./passport');
app.use(passport.initialize());

// --- AUTH ROUTES (/login) ---
require('./auth')(app);

// --- STATIC FILES ---
app.use(express.static(path.join(__dirname, 'public')));

// --- HOME ---
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- HELPERS ---
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// --- ROUTES ---

// 1) Return ALL movies (protected)
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (_req, res) => {
    try {
      const movies = await Movies.find().lean();
      res.status(200).json(movies);
    } catch (err) {
      res.status(500).send('Error: ' + err);
    }
  }
);

// 2) Return a single movie by title (protected, case-insensitive)
app.get(
  '/movies/:title',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const title = req.params.title;
      const movie = await Movies.findOne({
        Title: { $regex: new RegExp(`^${escapeRegExp(title)}$`, 'i') },
      }).lean();

      if (!movie) return res.status(404).send('Movie not found');
      res.json(movie);
    } catch (err) {
      res.status(500).send('Error: ' + err);
    }
  }
);

// 3) Return genre data by name (protected)
app.get(
  '/genres/:name',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const name = req.params.name;
      const movie = await Movies.findOne(
        { 'Genre.Name': { $regex: new RegExp(`^${escapeRegExp(name)}$`, 'i') } },
        { Genre: 1, _id: 0 }
      ).lean();

      if (!movie) return res.status(404).send('Genre not found');
      res.json(movie.Genre);
    } catch (err) {
      res.status(500).send('Error: ' + err);
    }
  }
);

// 4) Return director data by name (protected)
app.get(
  '/directors/:name',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      const name = req.params.name;
      const movie = await Movies.findOne(
        {
          'Director.Name': { $regex: new RegExp(`^${escapeRegExp(name)}$`, 'i') },
        },
        { Director: 1, _id: 0 }
      ).lean();

      if (!movie) return res.status(404).send('Director not found');
      res.json(movie.Director);
    } catch (err) {
      res.status(500).send('Error: ' + err);
    }
  }
);

// 5) Register new user (PUBLIC — do not protect) with HASHED PASSWORD
app.post('/users', async (req, res) => {
  try {
    const { Username, Password, Email, Birthday } = req.body;

    const existing = await Users.findOne({ Username });
    if (existing) return res.status(400).send('Username already exists');

    // make sure models.js has User.hashPassword
    const hashedPassword = Users.hashPassword(Password);

    const user = await Users.create({
      Username,
      Password: hashedPassword,
      Email,
      Birthday,
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 6) Update user info (protected + self-only)
app.put(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (req.user.Username !== req.params.username) {
        return res.status(400).send('Permission denied');
      }

      const update = {
        ...(req.body.Username && { Username: req.body.Username }),
        ...(req.body.Password && { Password: Users.hashPassword(req.body.Password) }), // re-hash if changing password
        ...(req.body.Email && { Email: req.body.Email }),
        ...(req.body.Birthday && { Birthday: req.body.Birthday }),
      };

      const user = await Users.findOneAndUpdate(
        { Username: req.params.username },
        { $set: update },
        { new: true }
      );

      if (!user) return res.status(404).send('User not found');
      res.json(user);
    } catch (err) {
      console.log(err);
      res.status(500).send('Error: ' + err);
    }
  }
);

// 7) Add a favorite movie (protected + self-only)
app.post(
  '/users/:username/movies/:movieId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (req.user.Username !== req.params.username) {
        return res.status(400).send('Permission denied');
      }

      const user = await Users.findOneAndUpdate(
        { Username: req.params.username },
        { $addToSet: { FavoriteMovies: req.params.movieId } },
        { new: true }
      );

      if (!user) return res.status(404).send('User not found');
      res.json(user);
    } catch (err) {
      res.status(500).send('Error: ' + err);
    }
  }
);

// 8) Remove a favorite movie (protected + self-only)
app.delete(
  '/users/:username/movies/:movieId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (req.user.Username !== req.params.username) {
        return res.status(400).send('Permission denied');
      }

      const user = await Users.findOneAndUpdate(
        { Username: req.params.username },
        { $pull: { FavoriteMovies: req.params.movieId } },
        { new: true }
      );

      if (!user) return res.status(404).send('User not found');
      res.json(user);
    } catch (err) {
      res.status(500).send('Error: ' + err);
    }
  }
);

// 9) Deregister user (protected + self-only)
app.delete(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      if (req.user.Username !== req.params.username) {
        return res.status(400).send('Permission denied');
      }

      const result = await Users.findOneAndDelete({ Username: req.params.username });
      if (!result) return res.status(404).send('User not found');
      res.send('User deleted');
    } catch (err) {
      res.status(500).send('Error: ' + err);
    }
  }
);

// (Optional) List users (protected)
app.get(
  '/users',
  passport.authenticate('jwt', { session: false }),
  async (_req, res) => {
    try {
      const users = await Users.find().lean();
      res.json(users);
    } catch (err) {
      res.status(500).send('Error: ' + err);
    }
  }
);

// --- ERROR HANDLER ---
app.use((err, _req, res, _next) => {
  console.error('🚨 Application Error:', err.stack);
  res.status(500).send('Something went wrong! Please try again later.');
});

// --- START SERVER ---
const port = process.env.PORT || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});