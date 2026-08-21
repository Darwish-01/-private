import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const port = process.env.PORT || 4000;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Gym / Fitness Class Booking API",
      version: "1.0.0",
      description:
        "API documentation for managing gym classes and member bookings. " +
        "Register a Trainer to create/manage class sessions, or a Member to browse and book them.",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: "Local Development Server",
      },
      {
        url: "https://REPLACE-WITH-YOUR-RENDER-URL.onrender.com",
        description: "Production Server (update after deploying)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", example: "66f1a2b3c4d5e6f7a8b9c0d1" },
            fullName: { type: "string", example: "Sara Ahmed" },
            email: { type: "string", example: "sara@example.com" },
            role: { type: "string", enum: ["Member", "Trainer"] },
          },
        },
        ClassSession: {
          type: "object",
          properties: {
            _id: { type: "string", example: "66f1a2b3c4d5e6f7a8b9c0d2" },
            title: { type: "string", example: "Morning Yoga" },
            capcity: { type: "integer", example: 10 },
            timeSlot: {
              type: "string",
              format: "date-time",
              example: "2026-09-01T08:00:00.000Z",
            },
            trainer: {
              oneOf: [
                { type: "string" },
                { $ref: "#/components/schemas/User" },
              ],
            },
          },
        },
        Booking: {
          type: "object",
          properties: {
            _id: { type: "string", example: "66f1a2b3c4d5e6f7a8b9c0d3" },
            status: { type: "string", enum: ["booked", "cancelled"] },
            classSession: {
              oneOf: [
                { type: "string" },
                { $ref: "#/components/schemas/ClassSession" },
              ],
            },
            member: {
              oneOf: [
                { type: "string" },
                { $ref: "#/components/schemas/User" },
              ],
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Something went wrong" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
 
  apis: [
    "./src/routes/*.ts",
    "./src/routes/*.js",
    "./dist/routes/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
