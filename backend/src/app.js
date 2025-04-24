// src/app.js
import express from 'express';
import mongoose from 'mongoose';
import './db/conn.js';
import path from 'path';
import { fileURLToPath } from 'url';
import hbs from 'hbs';
import Register from './models/register.js';
import bcryptjs from 'bcryptjs'
import bcrypt from 'bcryptjs';

// Handle __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
  
// App setup
const app = express();
const port = process.env.PORT || 3000;

// Paths
const static_path = path.join(__dirname, '../public');
const template_path = path.join(__dirname, '../templates/views');
const partials_path = path.join(__dirname, '../templates/partials');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(static_path));

// View engine setup
app.set('view engine', 'hbs');
app.set('views', template_path);
hbs.registerPartials(partials_path);

// Routes

// Home Page
app.get('/', (req, res) => {
  res.render('index');
});

// Login Page
app.get('/login', (req, res) => {
  res.render('login');
});

// Register Page (GET)
app.get('/register', (req, res) => {
  res.render('register');
});

// Login Form Submission (POST)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const useremail = await Register.findOne({ email: email });

    const isMatch = await bcrypt.compare(password,useremail.password);

    const token = await userRegister.generateAuthToken();

    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.status(400).render("login", { error: "Invalid email or password" });
    }

  } catch (e) {
    res.status(400).render("login", { error: "Error logging in: " + e.message });
  }
});


// Register Form Submission (POST)
app.post('/register', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    // Check if passwords match
    if (password === confirmPassword) {
      const userRegister = new Register({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        age: req.body.age,
        password: req.body.password
      });


      const token = await userRegister.generateAuthToken();


      // Save new user to database
      await userRegister.save();
      res.status(201).render('index');
    } else {
      res.send('Passwords do not match');
    }
  } catch (e) {
    res.status(400).send('Error registering user: ' + e.message);
  }
});

// Server start
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
