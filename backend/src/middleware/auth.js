import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Register from '../models/register.js';

dotenv.config();

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      throw new Error("No token provided");
    } 

  
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);

   
    const user = await Register.findOne({ _id: verifyUser._id });

    if (!user) {
      throw new Error('User not found');
    }

   
    const validTokens = [];

    for (const tokenObj of user.tokens) {
      try {
        const decoded = jwt.verify(tokenObj.token, process.env.SECRET_KEY);

        // If token matches current cookie token, keep it
        if (tokenObj.token === token) {
          validTokens.push({ token: tokenObj.token });
        }
      } catch (error) {
        // Ignore expired/invalid tokens
      }
    }

    user.tokens = validTokens;
    await user.save();

    req.token = token;
    req.user = user;


    next();
  } catch (e) {
    // console.log("Auth error:", e.message);
    res.status(401).send("Unauthorized: " + e.message);
  }
};

export default auth;
