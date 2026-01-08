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

// Middleware
app.use(bodyParser.json());
app.use(morgan('common'));
app.use(cors());

// MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/myFlixDB');

// ===== REGISTER USER =====
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

// ===== LOGIN =====
app.post('/login', async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.body.username });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.Password
    );

    if (!validPassword) {
      return res.status(400).send('Invalid password');
    }

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

// ===== GET USER (JWT PROTECTED) =====
app.get(
  '/users/:username',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // Use the authenticated user from the token
      const user = await Users.findOne({ Username: req.user.Username }).select('-Password');
      if (!user) return res.status(404).send('User not found.');
      return res.json(user);
    } catch (err) {
      console.error(err);
      return res.status(500).send('Error: ' + err);
    }
  }
);



// ===== GET ALL MOVIES (JWT PROTECTED) =====
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


// ===== UPDATE USER (JWT PROTECTED) =====
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
            ...(req.body.Password !== undefined && { Password: bcrypt.hashSync(req.body.Password, 10) }),
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



// ============================
// ============================
// FAVORITES (ADD / REMOVE)

// Add a movie to favorites
app.post(
  '/users/:username/movies/:movieId',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      // ✅ Use authenticated user from JWT (prevents username mismatch issues)
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

// Remove a movie from favorites
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


// ===== SERVER =====
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
