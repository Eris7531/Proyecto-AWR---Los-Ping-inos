
import express, { NextFunction, Request, Response } from "express";
import Game from "../models/games";
import Room from "../models/room";
import rankOptions from "../data/rankOptions";

const router = express.Router();

// Obtener todos los juegos
router.get(
  "/",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const games = await Game.find({}).sort({ name: 1 });

      // Cantidad de usuarios en salas, agrupada por juego.
      const counts = await Room.aggregate<{ _id: unknown; usersInRooms: number }>([
        { $group: { _id: "$game", usersInRooms: { $sum: { $size: "$users" } } } },
      ]);
      const countByGame = new Map(
        counts.map((c) => [String(c._id), c.usersInRooms])
      );

      response.status(200).json(
        games.map((game) => ({
          ...game.toJSON(),
          usersInRooms: countByGame.get(game._id.toString()) ?? 0,
        }))
      );
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/:id/ranks",
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const game = await Game.findById(request.params.id);

      if (!game) {
        return response.status(404).json({ error: "game not found" });
      }

      return response.json({
        gameId: game._id.toString(),
        gameName: game.name,
        ranks: rankOptions[game.name] ?? [],
      });
    } catch (error) {
      return next(error);
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
