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
const games_1 = __importDefault(require("../models/games"));
const initialGames = [
    {
        name: "Counter-Strike 2",
        image: "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg",
    },
    {
        name: "League of Legends",
        image: "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_0.jpg",
    },
    {
        name: "VALORANT",
        image: "https://media.valorant-api.com/agents/add6443a-41bd-e414-f6ad-e58d267f4e95/fullportrait.png",
    },
];
const seedGames = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const gameData of initialGames) {
        yield games_1.default.updateOne({ name: gameData.name }, { $setOnInsert: gameData }, { upsert: true });
    }
    console.log("Games seeded successfully.");
});
exports.default = seedGames;
