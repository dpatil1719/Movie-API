
// 1. Require Express
const express = require('express');

const morgan = require('morgan'); // ✅ Import Morgan



// 2. Initialize the Express app
const app = express();


// ✅ Use Morgan middleware to log requests
app.use(morgan('dev')); // 'dev' is a predefined format that’s concise and colored

// Serve static files from the 'public' folder
app.use(express.static('public'));




// 3. Define your top 10 movies
const topMovies = [
  { title: "The Shawshank Redemption", year: 1994 },
  { title: "The Godfather", year: 1972 },
  { title: "The Dark Knight", year: 2008 },
  { title: "Pulp Fiction", year: 1994 },
  { title: "Forrest Gump", year: 1994 },
  { title: "Inception", year: 2010 },
  { title: "Fight Club", year: 1999 },
  { title: "The Matrix", year: 1999 },
  { title: "The Lord of the Rings: The Return of the King", year: 2003 },
  { title: "Interstellar", year: 2014 }
];


// 4. Route for homepage "/"
app.get('/', (req, res) => {
    res.send('🎬 Welcome to My Movie API! Visit /movies to see the top 10 movies.');
  });


// 5. Create the GET route at /movies
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

// ✅ Error-generating test route
app.get('/cause-error', (req, res, next) => {
    const error = new Error('This is a test error!');
    next(error); // Pass to error-handling middleware
  });
  
  // ✅ Error-handling middleware
  app.use((err, req, res, next) => {
    console.error('🚨 Application Error:', err.stack);
    res.status(500).send('Something went wrong! Please try again later.');
  });
  

// 6. Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
