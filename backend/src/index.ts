import mongoose from "mongoose";
import app from "./app";
import config from "./utils/config";
import logger from "./utils/logger";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

async function startServer() {
  if (!config.MONGODB_URI || !config.MONGODB_DBNAME) {
    throw new Error("La configuración de MongoDB está incompleta");
  }

  await mongoose.connect(config.MONGODB_URI, {
    dbName: config.MONGODB_DBNAME,
  });

  app.listen(config.PORT, () => {
    logger.info(`Server running on port ${config.PORT}`);
  });
}

void startServer().catch((error: unknown) => {
  logger.error(
    error instanceof Error ? error.message : "No se pudo iniciar el backend",
  );
  process.exitCode = 1;
});
