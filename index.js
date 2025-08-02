const express = require('express');
const bodyParser = require('body-parser');
const uuid = require('uuid');

const app = express();
app.use(bodyParser.json());

let users = [
  {
    id: uuid.v4(),
    username: 'john_doe',
    password: 'password123',
    email: 'john@example.com',
    favoriteMovies: ['Inception']
  }
];

let movies = [
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through dream-sharing technology.',
    genre: {
      name: 'Sci-Fi',
      description: 'Science fiction explores futuristic concepts and alternate realities.'
    },
    director: {
      name: 'Christopher Nolan',
      bio: 'British-American director, known for mind-bending films.',
      birthYear: 1970,
      deathYear: null
    },
    imageURL: 'https://via.placeholder.com/300x450?text=Inception',
    featured: true
  },
  {
    title: 'The Godfather',
    description: 'The aging patriarch of an organized crime dynasty transfers control to his son.',
    genre: {
      name: 'Crime',
      description: 'Crime films focus on criminals, crime investigations, and the underworld.'
    },
    director: {
      name: 'Francis Ford Coppola',
      bio: 'American director and screenwriter known for The Godfather trilogy.',
      birthYear: 1939,
      deathYear: null
    },
    imageURL: 'https://via.placeholder.com/300x450?text=The+Godfather',
    featured: false
  }
];

app.get('/', (req, res) => {
  res.send('Welcome to the Movie API!');
});

// 1. Get all movies
app.get('/movies', (req, res) => {
  res.json(movies);
});

// 2. Get movie by title
app.get('/movies/:title', (req, res) => {
  const movie = movies.find(m => m.title.toLowerCase() === req.params.title.toLowerCase());
  if (movie) return res.json(movie);
  res.status(404).send('Movie not found.');
});

// 3. Get genre by name
app.get('/genres/:name', (req, res) => {
  const movie = movies.find(m => m.genre.name.toLowerCase() === req.params.name.toLowerCase());
  if (movie) return res.json(movie.genre);
  res.status(404).send('Genre not found.');
});

// 4. Get director by name
app.get('/directors/:name', (req, res) => {
  const movie = movies.find(m => m.director.name.toLowerCase() === req.params.name.toLowerCase());
  if (movie) return res.json(movie.director);
  res.status(404).send('Director not found.');
});

// 5. Register new user
app.post('/users', (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) return res.status(400).send('Missing user details.');

  const newUser = {
    id: uuid.v4(),
    username,
    password,
    email,
    favoriteMovies: []
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// 6. Update username
app.put('/users/:username', (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).send('User not found.');

  const { username, password, email } = req.body;
  if (username) user.username = username;
  if (password) user.password = password;
  if (email) user.email = email;

  res.json(user);
});

// 7. Add favorite movie
app.post('/users/:username/movies/:movieTitle', (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  const movie = movies.find(m => m.title.toLowerCase() === req.params.movieTitle.toLowerCase());

  if (!user) return res.status(404).send('User not found.');
  if (!movie) return res.status(404).send('Movie not found.');

  if (!user.favoriteMovies.includes(movie.title)) {
    user.favoriteMovies.push(movie.title);
  }

  res.send(`Movie '${movie.title}' added to ${user.username}'s favorites.`);
});

// 8. Remove favorite movie
app.delete('/users/:username/movies/:movieTitle', (req, res) => {
  const user = users.find(u => u.username === req.params.username);
  if (!user) return res.status(404).send('User not found.');

  user.favoriteMovies = user.favoriteMovies.filter(title => title.toLowerCase() !== req.params.movieTitle.toLowerCase());

  res.send(`Movie '${req.params.movieTitle}' removed from ${user.username}'s favorites.`);
});

// 9. Delete user
app.delete('/users/:username', (req, res) => {
  users = users.filter(u => u.username !== req.params.username);
  res.send(`User '${req.params.username}' has been deregistered.`);
});

const port = 8080;
app.listen(port, () => {
  console.log(`Movie API is running on http://localhost:${port}`);
});
