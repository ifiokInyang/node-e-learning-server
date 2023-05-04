import express from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import usersRouter from "./routes/usersRoutes";
import coursesRouter from "./routes/coursesRoutes";
import { connectDB } from "./Config/index";
import dotenv from "dotenv";
import { swaggerDoc } from "./utils";
import {
  appError,
  errorHandler,
  notFound,
} from "./Middlewares/errorMiddleware";
import { verifyPayment } from "./Middlewares/authMiddleware";
import passport from "passport";
import session from "express-session";
import "./utils/passport";

dotenv.config();

// this calls the database connection
connectDB();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(logger("dev"));
app.use(cookieParser());
app.use(session({ secret: `${process.env.sessionSecret}` }));
app.use(passport.initialize());
app.use(passport.session());

swaggerDoc(app);

//routes
app.use("/users", usersRouter);
app.use("/courses", coursesRouter);

app.get("/", (req, res) => {
  res.status(200).send("api is running");
});
// not found error handler
app.use(notFound);

// error handler
app.use(errorHandler);
// app.use(appError);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;