/* creamos testing.ts como ENDPOINT para el reinicio de la DB como parte de la p3 */

import express, { RequestHandler } from "express";
import User from "../models/users";
// import Room from "../models/room";
import Message from "../models/message";
// import Game from "../models/games";

const router = express.Router();

router.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

const resetDatabase: RequestHandler = async (_request, response, next) => {
  try {
    await User.deleteMany({});
    await Message.deleteMany({});
    
    response.status(200).json({ message: "Database reset" });
  } catch (error) {
    next(error);
  }
};
/* Se puede agregar
- await Game.deleteMany({});
- await Room.deleteMany({});
Si se requiere testear modificaciones a los juegos y las salas de estos.
Si se hace esto, cada test tendría que agregar sus juegos y salas al inicio del test.*/

router.post("/reset", resetDatabase);

export default router;