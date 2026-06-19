import express from "express";

const app = express();
app.disable("x-powered-by");
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "API is operational" });
});

export default app;
