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
const express_1 = __importDefault(require("express"));
const games_1 = __importDefault(require("../models/games"));
const router = express_1.default.Router();
// Obtener todos los juegos
router.get("/", (_request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const games = yield games_1.default.find({}).sort({ name: 1 });
        response.status(200).json(games);
    }
    catch (error) {
        next(error);
    }
}));
// Agregar un juego
router.post("/", (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, image } = request.body;
        if (typeof name !== "string" ||
            !name.trim() ||
            typeof image !== "string" ||
            !image.trim()) {
            response.status(400).json({
                error: "name and image are required",
            });
            return;
        }
        const game = new games_1.default({
            name: name.trim(),
            image: image.trim(),
            salas: [],
        });
        const savedGame = yield game.save();
        response.status(201).json(savedGame);
    }
    catch (error) {
        if (error instanceof Error &&
            "code" in error &&
            error.code === 11000) {
            response.status(409).json({
                error: "A game with this name already exists",
            });
            return;
        }
        next(error);
    }
}));
exports.default = router;
