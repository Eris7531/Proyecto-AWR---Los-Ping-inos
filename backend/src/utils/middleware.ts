
import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import logger from "./logger";
import config from "./config";

const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.info(`Method: ${request.method}`);
  logger.info(`Path: ${request.path}`);

  // No registrar request.body: puede contener contraseñas.
  next();
};

const unknownEndpoint = (
  _request: Request,
  response: Response,
  _next: NextFunction
) => {
  return response.status(404).json({ error: "unknown endpoint" });
};

const errorHandler = (
  error: Error & { code?: number },
  _request: Request,
  response: Response,
  next: NextFunction
) => {
  logger.error(error.message);
  logger.error(error.name);

  if (response.headersSent) {
    return next(error);
  }

  if (error.name === "CastError") {
    return response.status(400).json({ error: "malformatted id" });
  }

  if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000")
  ) {
    return response
      .status(400)
      .json({ error: "expected `username` to be unique" });
  }

  if (
    error.name === "JsonWebTokenError" ||
    error.name === "TokenExpiredError" ||
    error.name === "NotBeforeError"
  ) {
    return response.status(401).json({ error: "invalid token" });
  }

  return response.status(500).json({ error: "internal server error" });
};

export const withUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token: unknown = req.cookies?.token;

    if (typeof token !== "string" || !token) {
      res.status(401).json({ error: "missing token" });
      return;
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (
      typeof decoded === "string" ||
      !decoded ||
      typeof decoded.id !== "string" ||
      typeof decoded.csrf !== "string"
    ) {
      res.status(401).json({ error: "invalid token" });
      return;
    }

    const payload = decoded as JwtPayload & {
      id: string;
      csrf: string;
    };

    req.userId = payload.id;

    // GET y HEAD no modifican datos. Permiten recuperar el CSRF
    // desde el JWT firmado al restaurar una sesión.
    if (req.method === "GET" || req.method === "HEAD") {
      res.setHeader("X-CSRF-Token", payload.csrf);
      next();
      return;
    }

    const csrfHeader = req.get("X-CSRF-Token");

    if (!csrfHeader || csrfHeader !== payload.csrf) {
      res.status(403).json({ error: "invalid CSRF token" });
      return;
    }

    next();
  } catch {
    res.status(401).json({ error: "invalid token" });
  }
};

export default {
  requestLogger,
  unknownEndpoint,
  errorHandler,
};
