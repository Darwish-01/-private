import mongoose from "mongoose";

const ClassSessionsSchema= new mongoose.Schema({
    title:{
        type:String,
        required: true
    },
    capcity:{
        type:Number,
        required: true,
        min: [1, "Capacity must be a positive integer"],
        validate: {
            validator: Number.isInteger,
            message: "Capacity must be a positive integer"
        }
    },
    timeSlot:{
        type:Date,
        required:true
    },
    trainer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

})
export const ClassSession = mongoose.model("ClassSession",ClassSessionsSchema)