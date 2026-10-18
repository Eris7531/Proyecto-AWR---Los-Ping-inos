"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const games_1 = __importDefault(require("../models/games"));
const room_1 = __importDefault(require("../models/room"));
const users_1 = __importDefault(require("../models/users"));
const middleware_1 = require("../utils/middleware");
const router = (0, express_1.Router)();
// Todas las rutas de salas requieren sesión autenticada.
router.use(middleware_1.withUser);
function validId(id) {
    return mongoose_1.default.isValidObjectId(id);
}
// GET /api/rooms?gameId=<id>
// Lista salas de un juego. Solo devuelve información resumida.
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const filter = {};
        if (typeof req.query.gameId === "string") {
            if (!validId(req.query.gameId)) {
                return res.status(400).json({ error: "ID de juego inválido" });
            }
            filter.game = req.query.gameId;
        }
        const rooms = yield room_1.default.find(filter)
            .select("name rankName requiredRank game users maxPlayers")
            .populate("game", "name image")
            .sort({ name: 1 })
            .lean();
        return res.json(rooms.map((room) => ({
            id: room._id.toString(),
            name: room.name,
            rankName: room.rankName,
            requiredRank: room.requiredRank,
            game: room.game,
            currentPlayers: room.users.length,
            maxPlayers: room.maxPlayers,
        })));
    }
    catch (error) {
        return next(error);
    }
}));
// GET /api/rooms/:id
// El detalle y la lista de integrantes solo se entregan a miembros.
router.get("/:id", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({ error: "ID de sala inválido" });
        }
        const room = yield room_1.default.findById(req.params.id)
            .populate("game", "name image")
            .populate("users", "username avatar");
        if (!room) {
            return res.status(404).json({ error: "Sala no encontrada" });
        }
        const isMember = room.users.some((user) => {
            const memberId = typeof user === "object" && user !== null && "_id" in user
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
    }
    catch (error) {
        return next(error);
    }
}));
// POST /api/rooms
// Crea una sala para un juego existente y agrega al creador.
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, rankName, requiredRank, gameId, maxPlayers } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
        if (typeof name !== "string" ||
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
                    maxPlayers > 100))) {
            return res.status(400).json({
                error: "Se requiere nombre, rango, rango mínimo, juego válido y capacidad válida",
            });
        }
        const [game, user] = yield Promise.all([
            games_1.default.findById(gameId),
            users_1.default.findById(req.userId),
        ]);
        if (!game) {
            return res.status(404).json({ error: "Juego no encontrado" });
        }
        if (!user) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }
        const room = new room_1.default({
            name: name.trim(),
            rankName: rankName.trim(),
            requiredRank: requiredRank.trim(),
            game: game._id,
            users: [user._id],
            maxPlayers: maxPlayers !== null && maxPlayers !== void 0 ? maxPlayers : 5,
        });
        const savedRoom = yield room.save();
        try {
            yield games_1.default.updateOne({ _id: game._id }, { $addToSet: { salas: savedRoom._id } });
        }
        catch (error) {
            yield room_1.default.findByIdAndDelete(savedRoom._id);
            throw error;
        }
        return res.status(201).json(savedRoom);
    }
    catch (error) {
        return next(error);
    }
}));
// POST /api/rooms/:id/join
router.post("/:id/join", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({ error: "ID de sala inválido" });
        }
        const room = yield room_1.default.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ error: "Sala no encontrada" });
        }
        const user = yield users_1.default.findById(req.userId);
        if (!user) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }
        const userId = user._id.toString();
        if (room.users.some((id) => id.toString() === userId)) {
            return res.status(200).json({
                message: "Ya perteneces a esta sala",
                roomId: room._id.toString(),
            });
        }
        // Evita que dos peticiones simultáneas excedan la capacidad.
        const updatedRoom = yield room_1.default.findOneAndUpdate({
            _id: room._id,
            users: { $ne: user._id },
            $expr: { $lt: [{ $size: "$users" }, "$maxPlayers"] },
        }, { $addToSet: { users: user._id } }, { new: true, runValidators: true });
        if (!updatedRoom) {
            return res.status(409).json({
                error: "La sala está llena o ya no está disponible",
            });
        }
        return res.status(200).json({
            message: "Te has unido a la sala",
            roomId: updatedRoom._id.toString(),
        });
    }
    catch (error) {
        return next(error);
    }
}));
// POST /api/rooms/:id/leave
router.post("/:id/leave", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!validId(req.params.id)) {
            return res.status(400).json({ error: "ID de sala inválido" });
        }
        const room = yield room_1.default.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ error: "Sala no encontrada" });
        }
        yield room_1.default.updateOne({ _id: room._id }, { $pull: { users: new mongoose_1.default.Types.ObjectId(req.userId) } });
        return res.status(200).json({ message: "Has salido de la sala" });
    }
    catch (error) {
        return next(error);
    }
}));
exports.default = router;
