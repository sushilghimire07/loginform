import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/loginForm"
).then(()=>{
    console.log("Connection Sucessfull..!!")
}).catch((e)=>{
    console.log("Connection Unsucessful..!!",e)
})
