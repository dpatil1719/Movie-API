// index.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const morgan = require('morgan');

const { Movie: Movies, User: Users } = require('./models.js');

// --- DB CONNECTION (no deprecated flags needed) ---
mongoose.connect('mongodb://127.0.0.1:27017/cfDB');

// --- APP SETUP ---
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve static files from ./public (so /index.html works)
app.use(express.static(path.join(__dirname, 'public')));

// --- HOME ---
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- HELPERS ---
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// 1) Return ALL movies
app.get('/movies', async (_req, res) => {
  try {
    const movies = await Movies.find().lean();
    res.json(movies);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 2) Return a single movie by title (case-insensitive)
app.get('/movies/:title', async (req, res) => {
  try {
    const title = req.params.title;
    const movie = await Movies.findOne({
      Title: { $regex: new RegExp(`^${escapeRegExp(title)}$`, 'i') }
    }).lean();

    if (!movie) return res.status(404).send('Movie not found');
    res.json(movie);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 3) Return genre data (description) by name
app.get('/genres/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const movie = await Movies.findOne({
      'Genre.Name': { $regex: new RegExp(`^${escapeRegExp(name)}$`, 'i') }
    }, { Genre: 1, _id: 0 }).lean();

    if (!movie) return res.status(404).send('Genre not found');
    res.json(movie.Genre);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 4) Return director data by name
app.get('/directors/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const movie = await Movies.findOne({
      'Director.Name': { $regex: new RegExp(`^${escapeRegExp(name)}$`, 'i') }
    }, { Director: 1, _id: 0 }).lean();

    if (!movie) return res.status(404).send('Director not found');
    res.json(movie.Director);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 5) Register new user
app.post('/users', async (req, res) => {
  try {
    const { Username, Password, Email, Birthday } = req.body;
    const existing = await Users.findOne({ Username });
    if (existing) return res.status(400).send('Username already exists');

    const user = await Users.create({ Username, Password, Email, Birthday });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 6) Update user info
app.put('/users/:username', async (req, res) => {
  try {
    const update = req.body; // { Username?, Password?, Email?, Birthday? }
    const user = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $set: update },
      { new: true }
    );
    if (!user) return res.status(404).send('User not found');
    res.json(user);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 7) Add a favorite movie
app.post('/users/:username/movies/:movieId', async (req, res) => {
  try {
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
});

// 8) Remove a favorite movie
app.delete('/users/:username/movies/:movieId', async (req, res) => {
  try {
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
});

// 9) Deregister user
app.delete('/users/:username', async (req, res) => {
  try {
    const result = await Users.findOneAndDelete({ Username: req.params.username });
    if (!result) return res.status(404).send('User not found');
    res.send('User deleted');
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// (Optional) List users to avoid 404 on /users
app.get('/users', async (_req, res) => {
  try {
    const users = await Users.find().lean();
    res.json(users);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// --- ERROR HANDLER ---
app.use((err, _req, res, _next) => {
  console.error('🚨 Application Error:', err.stack);
  res.status(500).send('Something went wrong! Please try again later.');
});

// --- START SERVER ---
const PORT = 3000;
app.listen(PORT, () => console.log(`Server is running on http://localhost:${PORT}`));