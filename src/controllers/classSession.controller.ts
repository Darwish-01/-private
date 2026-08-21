import { Request, Response } from "express";
import { ClassSession } from "../models/classSession.model";
import { Booking } from "../models/booking.model";

export const createClassSession = async (req: Request, res: Response) => {
  try {
    const { title, capcity, timeSlot } = req.body;
    if (!title || !capcity || !timeSlot) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!Number.isInteger(capcity) || capcity <= 0) {
      return res.status(400).json({ message: "Capacity must be a positive integer" });
    }
    const sessionDate = new Date(timeSlot);
    if (isNaN(sessionDate.getTime()) || sessionDate <= new Date()) {
      return res.status(400).json({ message: "Sessions can only be created for future time slots" });
    }
    const newSession = await ClassSession.create({
      title,
      capcity,
      timeSlot: sessionDate,
      trainer: req.user!.id
    });
    res.status(201).json({ message: "Class session created successfully", newSession });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getClassSessions = async (req: Request, res: Response) => {
  try {
    const { title, trainer, timeSlot, availableOnly } = req.query;
    let query: any = {};
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }
    if (trainer) {
      
      const { User } = await import("../models/user.model.js");
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(trainer as string);
      if (isObjectId) {
        query.trainer = trainer;
      } else {
        const matchingTrainers = await User.find({
          fullName: { $regex: String(trainer), $options: "i" },
          role: "Trainer",
        }).select("_id");
        query.trainer = { $in: matchingTrainers.map((t) => t._id) };
      }
    }
    if (timeSlot) {
      const startOfDay = new Date(timeSlot as string);
      const endOfDay = new Date(timeSlot as string);
      endOfDay.setHours(23, 59, 59, 999);
      query.timeSlot = { $gte: startOfDay, $lte: endOfDay };
    }

    let sessions = await ClassSession.find(query).populate("trainer", "fullName email");

    if (availableOnly === "true") {
      const { Booking } = await import("../models/booking.model.js");
      const sessionsWithCounts = await Promise.all(
        sessions.map(async (session) => {
          const bookedCount = await Booking.countDocuments({
            classSession: session._id,
            status: "booked",
          });
          return { session, spotsRemaining: session.capcity - bookedCount };
        })
      );
      sessions = sessionsWithCounts
        .filter((s) => s.spotsRemaining > 0)
        .map((s) => s.session);
    }

    res.status(200).json(sessions);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateClassSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await ClassSession.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.trainer.toString() !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden: You can only update your own sessions" });
    }

    const { capcity, timeSlot } = req.body;
    if (capcity !== undefined && (!Number.isInteger(capcity) || capcity <= 0)) {
      return res.status(400).json({ message: "Capacity must be a positive integer" });
    }
    if (timeSlot !== undefined) {
      const sessionDate = new Date(timeSlot);
      if (isNaN(sessionDate.getTime()) || sessionDate <= new Date()) {
        return res.status(400).json({ message: "Sessions can only be scheduled for future time slots" });
      }
    }

    const updated = await ClassSession.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Session updated successfully", updated });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteClassSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await ClassSession.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.trainer.toString() !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own sessions" });
    }

    const activeBookingsCount = await Booking.countDocuments({
      classSession: String(id),
      status: "booked",
    });
    if (activeBookingsCount > 0) {
      return res.status(400).json({
        message: "Cannot delete a session that has confirmed bookings. Cancel the bookings first.",
      });
    }

    await ClassSession.findByIdAndDelete(id);
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getSessionBookings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await ClassSession.findById(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    if (session.trainer.toString() !== req.user!.id) {
      return res.status(403).json({ message: "Forbidden: You can only view bookings for your own sessions" });
    }

    const bookings = await Booking.find({ classSession: String(id) }).populate(
      "member",
      "fullName email"
    );
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};