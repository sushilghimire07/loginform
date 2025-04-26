import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import './db/conn.js';
import path from 'path';
import { fileURLToPath } from 'url';
import hbs from 'hbs';
import Register from './models/register.js';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import auth from './middleware/auth.js'

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const port = process.env.PORT || 3000;


const static_path = path.join(__dirname, '../public');
const template_path = path.join(__dirname, '../templates/views');
const partials_path = path.join(__dirname, '../templates/partials');



app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use(express.static(static_path));

app.use(cookieParser());



app.set('view engine', 'hbs');

app.set('views', template_path);

hbs.registerPartials(partials_path);


// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/about', (req, res) => res.render('about'));

app.get('/secret', auth ,(req, res) => {

    res.render("secret", { user: req.user }
    );
    // console.log(`This is the cookies we stored :${req.cookies.jwt}`);
    
    }) 

app.get("/logout",auth,async(req,res)=>{


  try{
   res.clearCookie("jwt")
  //  console.log("Logout")
   await req.user.save();
   res.render('login')

  }catch(e){
    res.status(404).send(e);

  }


})    
  
app.get('/login', (req, res) => res.render('login'));

app.get('/register', (req, res) => res.render('register'));




app.post('/register', async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).send("Passwords do not match");
    }

    const user = new Register(req.body);



    const token = await user.generateAuthToken();
    res.cookie("jwt", token, {
       httpOnly: true ,
       expires: new Date(Date.now()+ 3000)
      
      });
    // console.log(`Token send is `+token); Console token to check if  present

    await user.save();

   
    res.status(201).render("index");
  } catch (e) {
    res.status(500).send("Error registering user: " + e.message);
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Register.findOne({ email });

    if (!user) return res.status(400).render("login", { error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
  


    if (!isMatch) return res.status(400).render("login", { error: "Invalid credentials" });

    const token = await user.generateAuthToken();

    res.cookie("jwt", token, {
         httpOnly: true,
          expires: new Date(Date.now()+ 30000)
         });
    // console.log(`This is the cookies we stored :${req.cookies.jwt}`)     

    res.status(200).render("index");
  } catch (e) {
    res.status(500).send("Login failed: " + e.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
