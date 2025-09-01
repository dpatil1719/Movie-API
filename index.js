// index.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/cfDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();

app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Root
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// Get all movies
app.get('/movies', async (req, res) => {
  try {
    const movies = await Movies.find();
    res.json(movies);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// Get a movie by title
app.get('/movies/:title', async (req, res) => {
  try {
    const movie = await Movies.findOne({ Title: req.params.title });
    if (!movie) return res.status(404).send('Movie not found.');
    res.json(movie);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// Get genre by name
app.get('/genres/:name', async (req, res) => {
  try {
    const movie = await Movies.findOne({ 'Genre.Name': req.params.name });
    if (!movie) return res.status(404).send('Genre not found.');
    res.json(movie.Genre);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// Get director by name
app.get('/directors/:name', async (req, res) => {
  try {
    const movie = await Movies.findOne({ 'Director.Name': req.params.name });
    if (!movie) return res.status(404).send('Director not found.');
    res.json(movie.Director);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// Register a new user
app.post('/users', async (req, res) => {
  try {
    const newUser = await Users.create({
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// Update user info
app.put('/users/:username', async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $set: {
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true }
    );
    if (!updatedUser) return res.status(404).send('User not found.');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// Add a movie to favorites
app.post('/users/:username/movies/:movieId', async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $addToSet: { FavoriteMovies: req.params.movieId } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).send('User not found.');
    res.send(`Movie added to ${req.params.username}'s favorites.`);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// Remove movie from favorites
app.delete('/users/:username/movies/:movieId', async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $pull: { FavoriteMovies: req.params.movieId } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).send('User not found.');
    res.send(`Movie removed from ${req.params.username}'s favorites.`);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// Delete a user
app.delete('/users/:username', async (req, res) => {
  try {
    const deletedUser = await Users.findOneAndDelete({ Username: req.params.username });
    if (!deletedUser) return res.status(404).send('User not found.');
    res.send(`User '${req.params.username}' has been deregistered.`);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});