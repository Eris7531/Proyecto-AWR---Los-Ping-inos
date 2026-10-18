import { Router } from "express";
import mongoose from "mongoose";
import Game from "../models/games";
import Room from "../models/room";
import User from "../models/users";
import { withUser } from "../utils/middleware";

const router = Router();

// Todas las rutas de salas requieren sesión autenticada.
router.use(withUser);

function validId(id: string): boolean {
  return mongoose.isValidObjectId(id);
}

// GET /api/rooms?gameId=<id>
// Lista salas de un juego. Solo devuelve información resumida.
router.get("/", async (req, res, next) => {
  try {
    const filter: Record<string, unknown> = {};

    if (typeof req.query.gameId === "string") {
      if (!validId(req.query.gameId)) {
        return res.status(400).json({ error: "ID de juego inválido" });
      }
      filter.game = req.query.gameId;
    }

    const rooms = await Room.find(filter)
      .select("name rankName requiredRank game users maxPlayers")
      .populate("game", "name image")
      .sort({ name: 1 })
      .lean();

    return res.json(
      rooms.map((room) => ({
        id: room._id.toString(),
        name: room.name,
        rankName: room.rankName,
        requiredRank: room.requiredRank,
        game: room.game,
        currentPlayers: room.users.length,
        maxPlayers: room.maxPlayers,
      }))
    );
  } catch (error) {
    return next(error);
  }
});

router.get("/current", async (req, res, next) => {
  try {
    const room = await Room.findOne({ users: req.userId })
      .select("_id name updatedAt")
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({
      room: room ? { id: room._id.toString(), name: room.name } : null,
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/rooms/:id
// El detalle y la lista de integrantes solo se entregan a miembros.
router.get("/:id", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ error: "ID de sala inválido" });
    }

    const room = await Room.findById(req.params.id)
      .populate("game", "name image")
      .populate("users", "username avatar");

    if (!room) {
      return res.status(404).json({ error: "Sala no encontrada" });
    }

    const isMember = room.users.some((user) => {
      const memberId =
        typeof user === "object" && user !== null && "_id" in user
          ? String(user._id)
          : String(user);

      return memberId === req.userId;
    });

    if (!isMember) {
      return res.status(403).json({
        error: "Debes pertenecer a la sala para consultar sus detalles",
      });
    }

    return res.json(room);
  } catch (error) {
    return next(error);
  }
});

// POST /api/rooms
// Crea una sala para un juego existente y agrega al creador.
router.post("/", async (req, res, next) => {
  try {
    const { name, rankName, requiredRank, gameId, maxPlayers } =
      req.body ?? {};

    if (
      typeof name !== "string" ||
      name.trim().length < 3 ||
      name.trim().length > 60 ||
      typeof rankName !== "string" ||
      !rankName.trim() ||
      typeof requiredRank !== "string" ||
      !requiredRank.trim() ||
      typeof gameId !== "string" ||
      !validId(gameId) ||
      (maxPlayers !== undefined &&
        (!Number.isInteger(maxPlayers) ||
          maxPlayers < 1 ||
          maxPlayers > 100))
    ) {
      return res.status(400).json({
        error:
          "Se requiere nombre, rango, rango mínimo, juego válido y capacidad válida",
      });
    }

    const [game, user] = await Promise.all([
      Game.findById(gameId),
      User.findById(req.userId),
    ]);

    if (!game) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const room = new Room({
      name: name.trim(),
      rankName: rankName.trim(),
      requiredRank: requiredRank.trim(),
      game: game._id,
      users: [user._id],
      maxPlayers: maxPlayers ?? 5,
    });

    const savedRoom = await room.save();

    try {
      await Game.updateOne(
        { _id: game._id },
        { $addToSet: { salas: savedRoom._id } }
      );
    } catch (error) {
      await Room.findByIdAndDelete(savedRoom._id);
      throw error;
    }

    return res.status(201).json(savedRoom);
  } catch (error) {
    return next(error);
  }
});

// POST /api/rooms/:id/join
router.post("/:id/join", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ error: "ID de sala inválido" });
    }

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ error: "Sala no encontrada" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const userId = user._id.toString();
    const currentRooms = await Room.find({ users: user._id })
      .select("_id name")
      .sort({ updatedAt: -1 });

    if (room.users.some((id) => id.toString() === userId)) {
      await Room.updateMany(
        { _id: { $ne: room._id }, users: user._id },
        { $pull: { users: user._id } }
      );

      return res.status(200).json({
        message: "Ya perteneces a esta sala",
        roomId: room._id.toString(),
      });
    }

    const currentRoom = currentRooms.find(
      (candidate) => candidate._id.toString() !== room._id.toString()
    );

    if (currentRoom && req.body?.replaceExisting !== true) {
      return res.status(409).json({
        error: "confirmation required",
        currentRoom: {
          id: currentRoom._id.toString(),
          name: currentRoom.name,
        },
      });
    }

    // Evita que dos peticiones simultáneas excedan la capacidad.
    const updatedRoom = await Room.findOneAndUpdate(
      {
        _id: room._id,
        users: { $ne: user._id },
        $expr: { $lt: [{ $size: "$users" }, "$maxPlayers"] },
      },
      { $addToSet: { users: user._id } },
      { new: true, runValidators: true }
    );

    if (!updatedRoom) {
      return res.status(409).json({
        error: "La sala está llena o ya no está disponible",
      });
    }

    try {
      await Room.updateMany(
        { _id: { $ne: updatedRoom._id }, users: user._id },
        { $pull: { users: user._id } }
      );
    } catch (error) {
      await Room.updateOne(
        { _id: updatedRoom._id },
        { $pull: { users: user._id } }
      );
      throw error;
    }

    return res.status(200).json({
      message: "Te has unido a la sala",
      roomId: updatedRoom._id.toString(),
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/rooms/:id/leave
router.post("/:id/leave", async (req, res, next) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({ error: "ID de sala inválido" });
    }

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ error: "Sala no encontrada" });
    }

    await Room.updateOne(
      { _id: room._id },
      { $pull: { users: new mongoose.Types.ObjectId(req.userId) } }
    );

    return res.status(200).json({ message: "Has salido de la sala" });
  } catch (error) {
    return next(error);
  }
});

export default router;
