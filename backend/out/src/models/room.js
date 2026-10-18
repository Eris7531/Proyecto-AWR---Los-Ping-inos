"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const RoomSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 60,
    },
    // Rango descriptivo de la sala, por ejemplo: "Principiante", "Intermedio", "Competitivo", etc.
    rankName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 40,
    },
    // Rango mínimo requerido para unirse a la sala.
    requiredRank: {
        type: String,
        required: true,
        trim: true,
        maxlength: 40,
    },
    game: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Game",
        required: true,
        index: true,
    },
    users: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    maxPlayers: {
        type: Number,
        required: true,
        min: 1,
        max: 100, // Depende del juego.
        default: 5,
    },
    chat: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Chat",
        default: null,
    },
}, {
    timestamps: true,
    versionKey: false,
});
RoomSchema.set("toJSON", {
    transform: (_document, returnedObject) => {
        var _a;
        returnedObject.id = (_a = returnedObject._id) === null || _a === void 0 ? void 0 : _a.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});
const Room = mongoose_1.default.model("Room", RoomSchema);
exports.default = Room;
