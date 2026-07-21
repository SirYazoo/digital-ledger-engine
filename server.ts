import "dotenv/config";
import { Server } from "node:http";
import app from "./src/app";
import { closePool } from "./src/config/db";
import { connectProducer, disconnectProducer } from "./src/config/kafka";
import "./src/config/redis";
import { startOutboxWorker, stopOutboxWorker } from "./src/workers/outbox";

const PORT = 3000;
let server: Server;
const bootstrap = async () => {
  try {
    console.log("Initializing external services...");
    await connectProducer();
    server = app.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
      startOutboxWorker();
    });
  } catch (error) {
    console.error("Fatal boot error:", error);
    process.exit(1);
  }
};

bootstrap();

const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Commencing graceful shutdown...`);
  if (server) {
    try {
      stopOutboxWorker();
      await new Promise((resolve) => server.close(resolve));
      console.log("HTTP server closed.");
      await disconnectProducer();
      await closePool();
      console.log("Graceful shutdown complete.");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  }
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
