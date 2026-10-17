
import mongoose from "mongoose";
import config from "../utils/config";
import seedGames from "./seedGames";

// Añadir nuevas funciones de seed aquí cuando existan:
// import seedUsers from "./seedUsers";
// import seedRooms from "./seedRooms";
// import seedChats from "./seedChats";
const runSeeds = async (): Promise<void> => {
  try {
    if (!config.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured");
    }

    await mongoose.connect(config.MONGODB_URI, {
      dbName: config.MONGODB_DBNAME,
    });

    console.log("Starting database seeds...");

    await seedGames();

    // Activar cuando estén implementados:
    // await seedUsers();
    // await seedRooms();
    // await seedChats();

    console.log("All seeds completed successfully.");
  } catch (error) {
    console.error("Error running database seeds:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

void runSeeds();
