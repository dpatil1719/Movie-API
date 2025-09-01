// index.js
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

const { Movie: Movies, User: Users } = require('./models.js');

// --- DB CONNECTION ---
mongoose.connect('mongodb://127.0.0.1:27017/cfDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// --- APP SETUP ---
const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROOT ---
app.get('/', (_req, res) => res.send('Welcome to the Movie API!'));

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
    const movie = await Movies.findOne({
      Title: new RegExp(`^${req.params.title}$`, 'i')
    })
      .select('Title Description Genre Director ImagePath Featured')
      .lean();

    if (!movie) return res.status(404).send('Movie not found.');
    res.json(movie);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 3) Return data about a genre by name (description, etc.)
app.get('/genres/:name', async (req, res) => {
  try {
    const doc = await Movies.findOne({
      'Genre.Name': new RegExp(`^${req.params.name}$`, 'i')
    })
      .select('Genre')
      .lean();

    if (!doc) return res.status(404).send('Genre not found.');
    res.json(doc.Genre);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 4) Return data about a director by name (bio, birth year, death year)
app.get('/directors/:name', async (req, res) => {
  try {
    const doc = await Movies.findOne({
      'Director.Name': new RegExp(`^${req.params.name}$`, 'i')
    })
      .select('Director')
      .lean();

    if (!doc) return res.status(404).send('Director not found.');
    res.json(doc.Director);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 5) Allow new users to register
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

// 6) Allow users to update their user info
app.put('/users/:username', async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $set: {
          ...(req.body.Username !== undefined && { Username: req.body.Username }),
          ...(req.body.Password !== undefined && { Password: req.body.Password }),
          ...(req.body.Email !== undefined && { Email: req.body.Email }),
          ...(req.body.Birthday !== undefined && { Birthday: req.body.Birthday })
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

// 7) Allow users to add a movie to favorites
app.post('/users/:username/movies/:movieId', async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $addToSet: { FavoriteMovies: req.params.movieId } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).send('User not found.');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 8) Allow users to remove a movie from favorites
app.delete('/users/:username/movies/:movieId', async (req, res) => {
  try {
    const updatedUser = await Users.findOneAndUpdate(
      { Username: req.params.username },
      { $pull: { FavoriteMovies: req.params.movieId } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).send('User not found.');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 9) Allow existing users to deregister
app.delete('/users/:username', async (req, res) => {
  try {
    const deletedUser = await Users.findOneAndDelete({ Username: req.params.username });
    if (!deletedUser) return res.status(404).send('User not found.');
    res.send(`User '${req.params.username}' has been deregistered.`);
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
});

// 404 + Error handler
app.use((req, res) => res.status(404).send('Route not found'));
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

// START
const port = 3000;
app.listen(port, () => console.log(`Server is running on http://localhost:${port}`));