
import { Router } from "express";
import mongoose from "mongoose";
import Message from "../models/message";
import Room from "../models/room";
import { withUser } from "../utils/middleware";

const router = Router();

// Todas las rutas requieren sesión válida y CSRF en escrituras.
router.use(withUser);

function isValidId(id: string): boolean {
  return mongoose.isValidObjectId(id);
}

async function isRoomMember(
  roomId: string,
  userId: string
): Promise<boolean> {
  const room = await Room.findById(roomId).select("users");

  if (!room) {
    return false;
  }

  return room.users.some(
    (memberId) => memberId.toString() === userId
  );
}

// GET /api/rooms/:roomId/messages
router.get("/:roomId/messages", async (req, res, next) => {
  try {
    const { roomId } = req.params;

    if (!isValidId(roomId)) {
      return res.status(400).json({ error: "ID de sala inválido" });
    }

    const room = await Room.findById(roomId).select("users");

    if (!room) {
      return res.status(404).json({ error: "Sala no encontrada" });
    }

    const isMember = room.users.some(
      (memberId) => memberId.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({
        error: "Debes pertenecer a la sala para ver sus mensajes",
      });
    }

    const messages = await Message.find({ roomId: room._id })
      .sort({ createdAt: 1 })
      .limit(100)
      .populate("senderId", "username avatar")
      .lean();

    const result = messages.map((message) => {
      const sender = message.senderId as unknown as {
        _id: mongoose.Types.ObjectId;
        username: string;
        avatar?: string | null;
      };

      return {
        id: message._id.toString(),
        roomId: room._id.toString(),
        sender: {
          id: sender._id.toString(),
          username: sender.username,
          avatar: sender.avatar ?? null,
        },
        content: message.content,
        createdAt: message.createdAt,
      };
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

// POST /api/rooms/:roomId/messages
router.post("/:roomId/messages", async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { content } = req.body ?? {};

    if (!isValidId(roomId)) {
      return res.status(400).json({ error: "ID de sala inválido" });
    }

    if (
      typeof content !== "string" ||
      content.trim().length === 0 ||
      content.trim().length > 1000
    ) {
      return res.status(400).json({
        error: "El mensaje debe tener entre 1 y 1000 caracteres",
      });
    }

    const room = await Room.findById(roomId).select("users");

    if (!room) {
      return res.status(404).json({ error: "Sala no encontrada" });
    }

    const isMember = room.users.some(
      (memberId) => memberId.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({
        error: "Debes pertenecer a la sala para enviar mensajes",
      });
    }

    const message = await Message.create({
      roomId: room._id,
      senderId: new mongoose.Types.ObjectId(req.userId),
      content: content.trim(),
    });

    await message.populate("senderId", "username avatar");

    const sender = message.senderId as unknown as {
      _id: mongoose.Types.ObjectId;
      username: string;
      avatar?: string | null;
    };

    const messageId = String(message._id);
    const roomIdString = String(room._id);
    return res.status(201).json({
      id: messageId,
      roomId: roomIdString,
      sender: {
        id: sender._id.toString(),
        username: sender.username,
        avatar: sender.avatar ?? null,
      },
      content: message.content,
      createdAt: message.createdAt,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
