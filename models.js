// models.js
const mongoose = require('mongoose');

// Movie schema
const movieSchema = new mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String,
    Birth: String,   // e.g., "1970-07-30" or "1970"
    Death: String    // e.g., null or "1999"
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

// User schema
const userSchema = new mongoose.Schema({
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

module.exports = { Movie, User };