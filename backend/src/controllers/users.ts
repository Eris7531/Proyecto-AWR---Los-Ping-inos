
import bcrypt from "bcrypt";
import express from "express";
import User from "../models/users";
import { withUser } from "../utils/middleware";

const router = express.Router();

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

    return response.json(users);
  } catch (error) {
    return next(error);
  }
});

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

    return response.status(201).json({
      id: savedUser._id.toString(),
      username: savedUser.username,
  //    avatar: savedUser.avatar,
  //    rank: savedUser.rank,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
