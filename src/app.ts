import express from "express";
import routes from "./routes/api";

const app = express();
app.disable("x-powered-by");
app.use(express.json());
app.use("/api", routes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "API is operational" });
});

export default app;
