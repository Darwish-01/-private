import { Router } from "express";
import {
  createClassSession,
  getClassSessions,
  updateClassSession,
  deleteClassSession,
  getSessionBookings,
} from "../controllers/classSession.controller";
import { authMiddleware } from "../middlewares/auth.middlware";
import { authorize } from "../middlewares/role.middlware.js";

export const classSessionRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Class sessions published by trainers
 */

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Browse class sessions (search & filter)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: title
 *         schema: { type: string }
 *         description: Filter by class title (partial match, case-insensitive)
 *       - in: query
 *         name: trainer
 *         schema: { type: string }
 *         description: Filter by trainer id or trainer full name
 *       - in: query
 *         name: timeSlot
 *         schema: { type: string, format: date }
 *         description: Filter sessions happening on this day (YYYY-MM-DD)
 *       - in: query
 *         name: availableOnly
 *         schema: { type: boolean }
 *         description: If true, only return sessions with spots remaining
 *     responses:
 *       200:
 *         description: List of matching sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/ClassSession' }
 *   post:
 *     summary: Create a class session (Trainer only)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - capcity
 *               - timeSlot
 *             properties:
 *               title: { type: string, example: Morning Yoga }
 *               capcity: { type: integer, example: 10 }
 *               timeSlot: { type: string, format: date-time, example: "2026-09-01T08:00:00.000Z" }
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 newSession: { $ref: '#/components/schemas/ClassSession' }
 *       400:
 *         description: Validation error (bad capacity or non-future time slot)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Only trainers can create sessions
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
classSessionRouter.get("/", authMiddleware, getClassSessions);
classSessionRouter.post("/", authMiddleware, authorize("Trainer"), createClassSession);

/**
 * @swagger
 * /sessions/{id}:
 *   put:
 *     summary: Update a class session (only the owning Trainer)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               capcity: { type: integer }
 *               timeSlot: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Session updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 updated: { $ref: '#/components/schemas/ClassSession' }
 *       403:
 *         description: Not the owning trainer
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *   delete:
 *     summary: Delete a class session (only the owning Trainer, and only if it has no confirmed bookings)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       400:
 *         description: Session still has confirmed bookings
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Not the owning trainer
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
classSessionRouter.put("/:id", authMiddleware, authorize("Trainer"), updateClassSession);
classSessionRouter.delete("/:id", authMiddleware, authorize("Trainer"), deleteClassSession);

/**
 * @swagger
 * /sessions/{id}/bookings:
 *   get:
 *     summary: View all bookings for a session (only the owning Trainer)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of bookings for this session
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Booking' }
 *       403:
 *         description: Not the owning trainer
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
classSessionRouter.get("/:id/bookings", authMiddleware, authorize("Trainer"), getSessionBookings);
