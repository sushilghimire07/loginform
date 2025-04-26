import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const userSchema = new mongoose.Schema({
  firstName: {
      type: String, 
      required: true,
      trim: true
     },
  lastName: { 
      type: String,
      required: true,
        trim: true
     },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    validate: v => /^\d{10}$/.test(v)
  },
  age: 
    {
       type: Number,
       required: true,
       min: 18, 
       max: 100 
     },


  password: 
    {
       type: String,
      required: true,
      minlength: 6
   },


  tokens: 
      [{ 
        
        token:
         {
          type: String,
          required: true 
        } 
    }]
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  
  next();
});

userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
  } catch (e) {
    console.error("Token generation failed:", e.message);
    throw new Error("Token generation failed");
  }
};

const Register = mongoose.model("userInfo", userSchema,"userInfo");
export default Register;
