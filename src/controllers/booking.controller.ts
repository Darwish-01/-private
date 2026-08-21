import { Request, Response } from "express";
import { Booking } from "../models/booking.model";
import { ClassSession } from "../models/classSession.model";

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { classSessionId } = req.body;
    if (!classSessionId) {
      return res.status(400).json({ message: "Class session ID is required" });
    }

    const session = await ClassSession.findById(classSessionId);
    if (!session) {
      return res.status(404).json({ message: "Class session not found" });
    }

    if (new Date(session.timeSlot) <= new Date()) {
      return res.status(400).json({ message: "Cannot book a session that has already started or passed" });
    }

    const existingBooking = await Booking.findOne({
      classSession: classSessionId,
      member: req.user!.id,
      status: "booked"
    });
    if (existingBooking) {
      return res.status(400).json({ message: "You cannot book the same session twice" });
    }

    const currentBookingsCount = await Booking.countDocuments({
      classSession: classSessionId,
      status: "booked"
    });
    if (currentBookingsCount >= session.capcity) {
      return res.status(400).json({ message: "Session has reached full capacity" });
    }

    const newBooking = await Booking.create({
      classSession: classSessionId,
      member: req.user!.id,
      status: "booked"
    });

    res.status(201).json({ message: "Booking created successfully", newBooking });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ member: req.user!.id }).populate({
      path: "classSession",
      select: "title timeSlot capcity trainer",
      populate: { path: "trainer", select: "fullName email" },
    });
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.member.toString() !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden: You can only cancel your own bookings" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};