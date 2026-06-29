import express from "express";
import cors from "cors";
import changesRouter from "./routes/changes.js";
import templatesRouter from "./routes/templates.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"] }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/changes", changesRouter);
app.use("/api/templates", templatesRouter);

app.listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
