const express = require('express');
const morgan = require('morgan');
const app = express();
const port = 8080;

app.use(morgan('common'));
app.use(express.json()); // Needed to parse JSON body

// In-memory movie list
let movies = [
  {
    title: 'Inception',
    description: 'A skilled thief leads dream heists.',
    genre: 'Science Fiction',
    director: 'Christopher Nolan',
    imageURL: 'https://example.com/inception.jpg'
  },
  {
    title: 'Titanic',
    description: 'A love story on a doomed ship.',
    genre: 'Romance/Drama',
    director: 'James Cameron',
    imageURL: 'https://example.com/titanic.jpg'
  }
];

// GET all movies
app.get('/movies', (req, res) => {
  res.json(movies);
});

// GET a movie by title
app.get('/movies/:title', (req, res) => {
  const movieTitle = req.params.title.toLowerCase();
  const movie = movies.find(m => m.title.toLowerCase() === movieTitle);
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' });
  }
  res.json(movie);
});

// POST - Add a new movie
app.post('/movies', (req, res) => {
  const newMovie = req.body;

  // Check if title already exists
  const exists = movies.find(m => m.title.toLowerCase() === newMovie.title.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: 'Movie already exists' });
  }

  movies.push(newMovie);
  res.status(201).json({ message: 'Movie added', movie: newMovie });
});

// PUT - Update a movie by title
app.put('/movies/:title', (req, res) => {
  const titleToUpdate = req.params.title.toLowerCase();
  const movieIndex = movies.findIndex(m => m.title.toLowerCase() === titleToUpdate);

  if (movieIndex === -1) {
    return res.status(404).json({ error: 'Movie not found' });
  }

  // Update movie details
  movies[movieIndex] = { ...movies[movieIndex], ...req.body };
  res.json({ message: 'Movie updated', movie: movies[movieIndex] });
});

// DELETE - Remove a movie by title
app.delete('/movies/:title', (req, res) => {
  const titleToDelete = req.params.title.toLowerCase();
  const movieIndex = movies.findIndex(m => m.title.toLowerCase() === titleToDelete);

  if (movieIndex === -1) {
    return res.status(404).json({ error: 'Movie not found' });
  }

  const deletedMovie = movies.splice(movieIndex, 1);
  res.json({ message: 'Movie deleted', movie: deletedMovie[0] });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
