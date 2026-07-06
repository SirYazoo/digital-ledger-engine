import "dotenv/config";
import app from "./src/app";
import "./src/config/redis";
import { startOutboxWorker } from "./src/workers/outbox";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startOutboxWorker();
});
