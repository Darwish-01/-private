import mongoose from "mongoose";
const BookingSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ["booked","cancelled"]
    },
    classSession:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ClassSession",
        required: true
    },
    member:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
})
export const Booking = mongoose.model("Booking",BookingSchema)
