
import bcrypt from "bcrypt";
import express from "express";
import type { RequestHandler } from "express";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import multer from "multer";
import User from "../models/users";
import Game from "../models/games";
import { withUser } from "../utils/middleware";
import { toPublicUser } from "../utils/publicUser";
import rankOptions from "../data/rankOptions";

const router = express.Router();
const avatarDirectory = path.join(process.cwd(), "uploads", "avatars");

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype !== "image/jpeg") {
      callback(new Error("Only JPG images are allowed"));
      return;
    }

    callback(null, true);
  },
});

const parseAvatarUpload: RequestHandler = (request, response, next) => {
  avatarUpload.single("avatar")(request, response, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      const tooLarge = error.code === "LIMIT_FILE_SIZE";
      response.status(tooLarge ? 413 : 400).json({
        error: tooLarge
          ? "avatar must be 5 MB or smaller"
          : "invalid avatar upload",
      });
      return;
    }

    response.status(400).json({
      error: error instanceof Error ? error.message : "invalid avatar upload",
    });
  });
};

// Listar usuarios: requiere autenticación y CSRF
// si se trata de una petición que modifica datos.
// GET no requiere CSRF en el middleware propuesto.
router.get("/", withUser, async (_request, response, next) => {
  try {
    const users = await User.find({})
      .select("_id username avatar rank notes")
      .populate("notes", {
        content: 1,
        important: 1,
      });

    return response.json(users.map(toPublicUser));
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (request, response, next) => {
  try {
    const user = await User.findById(request.params.id);
    if (!user) {
      return response.status(404).json({ error: "user not found" });
    }
    return response.json(toPublicUser(user));
  } catch (error) {
    return next(error);
  }
});

router.patch(
  "/me/avatar",
  withUser,
  parseAvatarUpload,
  async (request, response, next) => {
    let savedFilePath: string | undefined;

    try {
      const file = request.file;
      if (!file) {
        return response.status(400).json({ error: "a JPG avatar file is required" });
      }

      if (
        file.buffer.length < 3 ||
        file.buffer[0] !== 0xff ||
        file.buffer[1] !== 0xd8 ||
        file.buffer[2] !== 0xff
      ) {
        return response.status(400).json({ error: "file is not a valid JPG image" });
      }

      const user = await User.findById(request.userId);
      if (!user) return response.status(404).json({ error: "user not found" });

      const previousAvatar = user.avatar;
      await mkdir(avatarDirectory, { recursive: true });

      const filename = `${randomUUID()}.jpg`;
      savedFilePath = path.join(avatarDirectory, filename);
      await writeFile(savedFilePath, file.buffer, { flag: "wx" });

      user.avatar = `/uploads/avatars/${filename}`;
      try {
        await user.save();
      } catch (error) {
        await unlink(savedFilePath).catch(() => undefined);
        throw error;
      }

      const avatarPrefix = "/uploads/avatars/";
      if (previousAvatar?.startsWith(avatarPrefix)) {
        const previousFilename = path.basename(previousAvatar);
        if (`${avatarPrefix}${previousFilename}` === previousAvatar) {
          await unlink(path.join(avatarDirectory, previousFilename)).catch(
            () => undefined,
          );
        }
      }

      return response.json(toPublicUser(user));
    } catch (error) {
      if (savedFilePath) await unlink(savedFilePath).catch(() => undefined);
      return next(error);
    }
  },
);

router.post("/me/ranks", withUser, async (request, response, next) => {
  try {
    const { gameId, rankName } = request.body ?? {};

    if (
      typeof gameId !== "string" ||
      typeof rankName !== "string" ||
      !rankName.trim()
    ) {
      return response.status(400).json({ error: "gameId and rankName are required" });
    }

    const game = await Game.findById(gameId);
    if (!game) return response.status(404).json({ error: "game not found" });

    const normalizedRank = rankName.trim();
    if (!(rankOptions[game.name] ?? []).includes(normalizedRank)) {
      return response.status(400).json({ error: "rank is not valid for this game" });
    }

    const user = await User.findById(request.userId);
    if (!user) return response.status(404).json({ error: "user not found" });

    const gameObjectId = game._id.toString();
    if (user.rank.some((rank) => rank.game.id === gameObjectId)) {
      return response.status(409).json({ error: "rank for this game already exists" });
    }

    user.rank.push({
      id: randomUUID(),
      game: { id: gameObjectId, gameName: game.name },
      rankName: normalizedRank,
    });

    await user.save();
    return response.status(201).json(toPublicUser(user));
  } catch (error) {
    return next(error);
  }
});

router.patch(
  "/me/ranks/:rankId",
  withUser,
  async (request, response, next) => {
    try {
      const { rankName } = request.body ?? {};

      if (typeof rankName !== "string" || !rankName.trim()) {
        return response.status(400).json({ error: "rankName is required" });
      }

      const user = await User.findById(request.userId);
      if (!user) return response.status(404).json({ error: "user not found" });

      const rank = user.rank.find((entry) => entry.id === request.params.rankId);
      if (!rank) return response.status(404).json({ error: "rank not found" });

      const game = await Game.findById(rank.game.id);
      if (!game) return response.status(404).json({ error: "game not found" });

      const normalizedRank = rankName.trim();
      if (!(rankOptions[game.name] ?? []).includes(normalizedRank)) {
        return response.status(400).json({ error: "rank is not valid for this game" });
      }

      rank.rankName = normalizedRank;
      await user.save();

      return response.json(toPublicUser(user));
    } catch (error) {
      return next(error);
    }
  }
);

// Registro público
router.post("/", async (request, response, next) => {
  try {
    const { username, password } = request.body ?? {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      password.length < 8
    ) {
      return response.status(400).json({
        error:
          "Username and a password of at least 8 characters are required",
      });
    }

    const normalizedUsername = username.trim();

    const existingUser = await User.findOne({
      username: normalizedUsername,
    });

    if (existingUser) {
      return response.status(409).json({
        error: "Username already exists",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      username: normalizedUsername,
      passwordHash,
    });

    const savedUser = await user.save();

    return response.status(201).json(toPublicUser(savedUser));
  } catch (error) {
    return next(error);
  }
});

export default router;
