import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import express from "express";
import User from "../models/users";
import config from "../utils/config";
import { withUser } from "../utils/middleware";
import { toPublicUser } from "../utils/publicUser";

const router = express.Router();

router.post("/", async (request, response) => {
  const { username, password } = request.body;

  const user = await User.findOne({ username });
  if (user) {
    const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!passwordCorrect) {
      response.status(401).json({
        error: "invalid username or password",
      });
    } else {
      const userForToken = {
        username: user.username,
        csrf: crypto.randomUUID(),
        id: user._id,
      };

      const token = jwt.sign(userForToken, config.JWT_SECRET, {
        expiresIn: 60 * 60,
      });
      response.setHeader("X-CSRF-Token", userForToken.csrf);
      response.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
      response.status(200).json(toPublicUser(user));
    }
  } else {
    response.status(401).json({
      error: "invalid username or password",
    });
  }
});

router.get("/me", withUser, async (request, response) => {
  const user = await User.findById(request.userId);
  if (!user) {
    return response.status(401).json({ error: "user no longer exists" });
  }
  return response.status(200).json(toPublicUser(user));
});


router.post("/logout", withUser, (_request, response) => {
  response.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response.status(200).json({
    message: "Logged out successfully",
  });
});


export default router;