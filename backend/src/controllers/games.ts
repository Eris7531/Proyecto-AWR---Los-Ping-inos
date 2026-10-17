
import express, { NextFunction, Request, Response } from "express";
import Game from "../models/games";

const router = express.Router();

// Obtener todos los juegos
router.get(
  "/",
  async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const games = await Game.find({}).sort({ name: 1 });
      response.status(200).json(games);
    } catch (error) {
      next(error);
    }
  }
);

// Agregar un juego
router.post(
  "/",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { name, image } = request.body;

      if (
        typeof name !== "string" ||
        !name.trim() ||
        typeof image !== "string" ||
        !image.trim()
      ) {
        response.status(400).json({
          error: "name and image are required",
        });
        return;
      }

      const game = new Game({
        name: name.trim(),
        image: image.trim(),
        salas: [],
      });

      const savedGame = await game.save();

      response.status(201).json(savedGame);
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === 11000
      ) {
        response.status(409).json({
          error: "A game with this name already exists",
        });
        return;
      }

      next(error);
    }
  }
);

export default router;
