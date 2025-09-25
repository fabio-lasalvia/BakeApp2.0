///// Import dei pacchetti esterni /////
import express from "express";
import "dotenv/config";
import cors from "cors";
import morgan from "morgan";
import passport from "passport";

///// Import configurazioni interne /////
import { connectDB } from "./db.js";
import googleStrategy from "./config/passport.config.js";

///// Import dei middleware custom /////
import errorHandler from "./middlewares/errorHandler.js";
import { authentication } from "./middlewares/auth/authentication.js";

///// Import delle routes /////
import authRouter from "./routes/authRoutes.js";
import usersRouter from "./routes/usersRoutes.js";
import productsRouter from "./routes/productsRoutes.js";
import ordersRouter from "./routes/ordersRoutes.js";


///// Inizializzazione server /////
const server = express();
const port = process.env.PORT || 5000;

///// Middlewares globali /////
server.use(cors());
server.use(morgan("tiny"));
server.use(express.json());

///// Passport (strategia Google OAuth) /////
passport.use(googleStrategy);


///// Routes /////
server.use("/auth", authRouter);
server.use("/users", usersRouter);
server.use("/products", productsRouter);
server.use("/orders", ordersRouter);


///// Error handler /////
server.use(errorHandler);


///// Connessione DB e avvio server /////
connectDB();
server.listen(port, () =>
  console.log(`Server avviato sulla porta ${port}`)
);



//i controlli XSS anche nel frontend
