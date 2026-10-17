import Game from "../models/games";
import Room from "../models/room";

const initialRooms = [
  { name: "Sala Ranked", rankName: "Ranked", requiredRank: "Plata", maxPlayers: 5, gameName: "Counter-Strike 2" },
  { name: "Sala Casual", rankName: "Casual", requiredRank: "Hierro", maxPlayers: 5, gameName: "Counter-Strike 2" },
  { name: "Sala Principiantes", rankName: "Principiantes", requiredRank: "Hierro", maxPlayers: 5, gameName: "Counter-Strike 2" },
  { name: "Sala Torneo", rankName: "Torneo", requiredRank: "Oro", maxPlayers: 5, gameName: "Counter-Strike 2" },
  { name: "Sala Competitiva", rankName: "Competitiva", requiredRank: "Plata", maxPlayers: 5, gameName: "League of Legends" },
  { name: "Sala Normal", rankName: "Normal", requiredRank: "Hierro", maxPlayers: 5, gameName: "League of Legends" },
  { name: "Sala Deathmatch", rankName: "Deathmatch", requiredRank: "Hierro", maxPlayers: 5, gameName: "VALORANT" },
  { name: "Sala tryhard", rankName: "Tryhard", requiredRank: "Oro", maxPlayers: 5, gameName: "VALORANT" },
];

const seedRooms = async (): Promise<void> => {
  for (const { gameName, ...roomData } of initialRooms) {
    const game = await Game.findOne({ name: gameName });
    if (!game) {
      throw new Error(`No existe el juego "${gameName}". Ejecuta seedGames antes de seedRooms.`);
    }

    const room = await Room.findOneAndUpdate(
      { name: roomData.name, game: game._id },
      {
        $setOnInsert: {
          ...roomData,
          game: game._id,
          users: [],
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    // Mantiene la lista de referencias del juego sincronizada sin duplicados.
    await Game.updateOne(
      { _id: game._id },
      { $addToSet: { salas: room._id } }
    );
  }

  console.log("Salas iniciales creadas/verificadas correctamente.");
};

export default seedRooms;