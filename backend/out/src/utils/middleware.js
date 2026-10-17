"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("./logger"));
const config_1 = __importDefault(require("./config"));
const requestLogger = (request, response, next) => {
    logger_1.default.info(`Method: ${request.method}`);
    logger_1.default.info(`Path: ${request.path}`);
    // No registrar request.body: puede contener contraseñas.
    next();
};
const unknownEndpoint = (_request, response, _next) => {
    return response.status(404).json({ error: "unknown endpoint" });
};
const errorHandler = (error, _request, response, next) => {
    logger_1.default.error(error.message);
    logger_1.default.error(error.name);
    if (response.headersSent) {
        return next(error);
    }
    if (error.name === "CastError") {
        return response.status(400).json({ error: "malformatted id" });
    }
    if (error.name === "ValidationError") {
        return response.status(400).json({ error: error.message });
    }
    if (error.name === "MongoServerError" &&
        error.message.includes("E11000")) {
        return response
            .status(400)
            .json({ error: "expected `username` to be unique" });
    }
    if (error.name === "JsonWebTokenError" ||
        error.name === "TokenExpiredError" ||
        error.name === "NotBeforeError") {
        return response.status(401).json({ error: "invalid token" });
    }
    return response.status(500).json({ error: "internal server error" });
};
const withUser = (req, res, next) => {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
        if (typeof token !== "string" || !token) {
            res.status(401).json({ error: "missing token" });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_SECRET);
        if (typeof decoded === "string" ||
            !decoded ||
            typeof decoded.id !== "string" ||
            typeof decoded.csrf !== "string") {
            res.status(401).json({ error: "invalid token" });
            return;
        }
        const payload = decoded;
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
    }
    catch (_b) {
        res.status(401).json({ error: "invalid token" });
    }
};
exports.withUser = withUser;
exports.default = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
};
