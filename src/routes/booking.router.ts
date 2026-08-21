import { Router } from "express";
import { createBooking, cancelBooking, getMyBookings } from "../controllers/booking.controller";
import { authMiddleware } from "../middlewares/auth.middlware";
import { authorize } from "../middlewares/role.middlware.js";

export const bookingRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Member bookings for class sessions
 */

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Book a spot in a class session (Member only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classSessionId
 *             properties:
 *               classSessionId:
 *                 type: string
 *                 example: 66f1a2b3c4d5e6f7a8b9c0d2
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 newBooking: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         description: Session full, already booked, or session already started
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Only members can book sessions
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Class session not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
bookingRouter.post("/", authMiddleware, authorize("Member"), createBooking);

/**
 * @swagger
 * /bookings/mine:
 *   get:
 *     summary: List the logged-in member's own bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of the member's bookings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Booking' }
 *       403:
 *         description: Only members have bookings
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
bookingRouter.get("/mine", authMiddleware, authorize("Member"), getMyBookings);

/**
 * @swagger
 * /bookings/{id}/cancel:
 *   put:
 *     summary: Cancel a booking (only the member who made it)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Booking cancelled successfully, frees a spot in the session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 booking: { $ref: '#/components/schemas/Booking' }
 *       400:
 *         description: Booking already cancelled
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       403:
 *         description: Not your own booking
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       404:
 *         description: Booking not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
bookingRouter.put("/:id/cancel", authMiddleware, authorize("Member"), cancelBooking);
