import Room from "../models/Room"; 
import User from "../models/users";

const seedRooms = async (): Promise<void> => {
  const randomUser = await User.findOne();
  // Si no hay usuarios aún, generamos un ID falso pero válido para que no se caiga
  const participants = randomUser ? [randomUser._id] : [];

  const initialRooms = [
    { name: "Sala de Prueba", gameId: "test", participants: participants }
  ];

  for (const roomData of initialRooms) {
    await Room.updateOne({ name: roomData.name }, { $setOnInsert: roomData }, { upsert: true });
  }
  console.log("Rooms seeded successfully.");
};

export default seedRooms;