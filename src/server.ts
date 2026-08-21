import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import { authRouter } from "./routes/auth.router.js";
import { classSessionRouter } from "./routes/classSession.router.js";
import { bookingRouter } from "./routes/booking.router.js";
import { setupSwagger } from "./swagger/swagger.js";

const app = express();

const port = process.env.PORT || 4000;

app.use(express.json());

setupSwagger(app);

app.use("/Auth", authRouter);
app.use("/sessions", classSessionRouter);
app.use("/bookings", bookingRouter);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is sailing at http://localhost:${port}`);
    console.log(`Swagger Docs available at http://localhost:${port}/api-docs`);
  });
});