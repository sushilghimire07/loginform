import 'dotenv';
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';

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
      validate: {
        validator: function(v) {
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        // message: props => `${props.value} is not a valid email address!`
      }
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function(v) {
          return /^\d{10}$/.test(v);  // Assuming 10 digits for phone number
        },
        // message: props => `${props.value} is not a valid phone number!`
      }
    },
    age: {
      type: Number,
      required: true,
      min: 18, // Assuming users must be at least 18
      max: 100, 
    },
    password: {
      type: String,
      required: true,
      minlength: 6 
    },
    tokens:[{
      token:{
        type:String,
        required:true
      }
    }]
  });

  
  userSchema.methods.generateAuthToken = async function () {
    try {
      
      const token = jwt.sign({ _id: this._id.toString() }, process.env["SECRET_KEY"]);
    
      this.tokens = this.tokens.concat({ token });
  
      await this.save();

      return token;


    } catch (e) {
      // console.error("Token generation error:", e); 
      throw new Error("Token generation failed");
    }
  };
  


  userSchema.pre("save",async function(next){
       if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password,5)
       }
       next();
  })


//   we need to create Collection

const Register = new mongoose.model("userInfo",userSchema,"userInfo");
export default Register;