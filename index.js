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

/* ===== CORS (STRICT + PREFLIGHT SAFE) ===== */
const allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:8080",
  "https://dpatil1719.github.io"
];

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (curl, Postman)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error("CORS blocked: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Always respond to preflight
app.options("*", cors());

/* ===== MIDDLEWARE ===== */
app.use(bodyParser.json());
app.use(morgan('common'));

/* ===== HEALTH CHECK ===== */
app.get('/', (req, res) => {
  res.send('myFlix API is running ✅');
});

/* ===== MONGODB ===== */
const mongoUri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myFlixDB';

console.log('Connecting to MongoDB…');

mongoose
  .connect(mongoUri)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });

/* ===== AUTH ===== */

/* ===== REGISTER USER (PUBLIC) ===== */
app.post("/users", async (req, res) => {
  try {
    const { Username, Password, Email, Birthday } = req.body;

    if (!Username || !Password || !Email) {
      return res.status(400).send("Username, Password, and Email are required");
    }

    const existingUser = await Users.findOne({ Username });
    if (existingUser) {
      return res.status(400).send("Username already exists");
    }

    const hashedPassword = bcrypt.hashSync(Password, 10);

    const newUser = await Users.create({
      Username,
      Password: hashedPassword,
      Email,
      Birthday
    });

    // never return password
    const userSafe = newUser.toObject();
    delete userSafe.Password;

    return res.status(201).json(userSafe);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Error: " + err);
  }
});


app.post('/login', async (req, res) => {
  const user = await Users.findOne({ Username: req.body.username });
  if (!user) return res.status(400).send('User not found');

  const valid = await bcrypt.compare(req.body.password, user.Password);
  if (!valid) return res.status(400).send('Invalid password');

  const token = jwt.sign(
    { Username: user.Username },
    process.env.JWT_SECRET || 'myflix_secret_key',
    { expiresIn: '7d' }
  );

  res.json({ user, token });
});

/* ===== MOVIES ===== */
app.get(
  '/movies',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const movies = await Movies.find();
    res.json(movies);
  }
);

