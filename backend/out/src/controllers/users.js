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
const bcrypt_1 = __importDefault(require("bcrypt"));
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("../models/users"));
const middleware_1 = require("../utils/middleware");
const router = express_1.default.Router();
// Listar usuarios: requiere autenticación y CSRF
// si se trata de una petición que modifica datos.
// GET no requiere CSRF en el middleware propuesto.
router.get("/", middleware_1.withUser, (_request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield users_1.default.find({})
            .select("_id username avatar rank notes")
            .populate("notes", {
            content: 1,
            important: 1,
        });
        return response.json(users);
    }
    catch (error) {
        return next(error);
    }
}));
// Registro público
router.post("/", (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { username, password } = (_a = request.body) !== null && _a !== void 0 ? _a : {};
        if (typeof username !== "string" ||
            typeof password !== "string" ||
            !username.trim() ||
            password.length < 8) {
            return response.status(400).json({
                error: "Username and a password of at least 8 characters are required",
            });
        }
        const normalizedUsername = username.trim();
        const existingUser = yield users_1.default.findOne({
            username: normalizedUsername,
        });
        if (existingUser) {
            return response.status(409).json({
                error: "Username already exists",
            });
        }
        const passwordHash = yield bcrypt_1.default.hash(password, 10);
        const user = new users_1.default({
            username: normalizedUsername,
            passwordHash,
        });
        const savedUser = yield user.save();
        return response.status(201).json({
            id: savedUser._id.toString(),
            username: savedUser.username,
            //    avatar: savedUser.avatar,
            //    rank: savedUser.rank,
        });
    }
    catch (error) {
        return next(error);
    }
}));
exports.default = router;
