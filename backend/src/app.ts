
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import path from "node:path";

import logger from "./utils/logger";
import config from "./utils/config";
import middleware from "./utils/middleware";
import usersRouter from "./controllers/users";
import loginRouter from "./controllers/login";

import gamesRouter from "./controllers/games";
import roomsRouter from "./controllers/rooms";

const app = express();

mongoose.set("strictQuery", false);

if (config.MONGODB_URI) {
  mongoose
    .connect(config.MONGODB_URI, {
      dbName: config.MONGODB_DBNAME,
    })
    .catch((error: Error) => {
      logger.error(`Error connecting to MongoDB: ${error.message}`);
    });
}

const clientBuildPath = path.join(__dirname, "dist");

app.use(express.json());
app.use(cookieParser());
app.use(middleware.requestLogger);

app.use(express.static(clientBuildPath));

app.use("/api/login", loginRouter);
app.use("/api/users", usersRouter);
app.use("/api/games", gamesRouter);
app.use("/api/rooms", roomsRouter);

// Las rutas API inexistentes deben responder 404,
// no recibir el index.html de React.
app.use("/api", middleware.unknownEndpoint);

// Fallback para React Router.
// La expresión regular funciona con Express 4 y Express 5.
app.get(/.*/, (_req, res, next) => {
  res.sendFile(
    path.join(clientBuildPath, "index.html"),
    (error) => {
      if (error) next(error);
    }
  );
});

app.use(middleware.errorHandler);

export default app;
