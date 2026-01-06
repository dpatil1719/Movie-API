const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const JWT_SECRET = 'myflix_secret_key';

// ===== CORS =====
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(morgan('common'));

// ===== MongoDB =====
mongoose.connect('mongodb://127.0.0.1:27017/myFlixDB');

// ===== User Model =====
const Users = mongoose.model('User', new mongoose.Schema({
  Username: { type: String, required: true, unique: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: Date,
  FavoriteMovies: [String]
}));

// ===== REGISTER =====
app.post('/users', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new Users({
      Username: req.body.username,
      Password: hashedPassword,
      Email: req.body.email,
      Birthday: req.body.birthday
    });

    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

// ===== LOGIN (THIS WAS MISSING) =====
app.post('/login', async (req, res) => {
  try {
    const user = await Users.findOne({ Username: req.body.username });
    if (!user) {
      return res.status(400).send('User not found');
    }

    const validPassword = await bcrypt.compare(req.body.password, user.Password);
    if (!validPassword) {
      return res.status(400).send('Invalid password');
    }

    const token = jwt.sign(
      { username: user.Username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        Username: user.Username,
        Email: user.Email,
        Birthday: user.Birthday,
        FavoriteMovies: user.FavoriteMovies
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed');
  }
});

// ===== SERVER =====
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
