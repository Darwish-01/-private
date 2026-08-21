import mongoose from "mongoose";

const UserSchema= new mongoose.Schema({
    fullName:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true,
        unique:true
    },
    hashedPassword:{
        type:String,
        required: true
    },
    role: {
        type: String,
        enum: ["Trainer","Member"]
    }

})
export let User = mongoose.model('User',UserSchema)