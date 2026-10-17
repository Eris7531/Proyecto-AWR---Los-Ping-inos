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
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../utils/config"));
const seedGames_1 = __importDefault(require("./seedGames"));
// Añadir nuevas funciones de seed aquí cuando existan:
// import seedUsers from "./seedUsers";
// import seedRooms from "./seedRooms";
// import seedChats from "./seedChats";
const runSeeds = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!config_1.default.MONGODB_URI) {
            throw new Error("MONGODB_URI is not configured");
        }
        yield mongoose_1.default.connect(config_1.default.MONGODB_URI, {
            dbName: config_1.default.MONGODB_DBNAME,
        });
        console.log("Starting database seeds...");
        yield (0, seedGames_1.default)();
        // Activar cuando estén implementados:
        // await seedUsers();
        // await seedRooms();
        // await seedChats();
        console.log("All seeds completed successfully.");
    }
    catch (error) {
        console.error("Error running database seeds:", error);
        process.exitCode = 1;
    }
    finally {
        yield mongoose_1.default.disconnect();
    }
});
void runSeeds();
