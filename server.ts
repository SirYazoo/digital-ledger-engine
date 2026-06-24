import "dotenv/config";
import app from "./src/app";
import "./src/config/redis";

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
