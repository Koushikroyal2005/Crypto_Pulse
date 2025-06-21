import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import connectDb from "./config/connectionDb.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors({
  origin: "https://crypto-pulse-8dtn.onrender.com",
  credentials: true
}));

app.use(express.json());
app.use("/api", authRoutes);

app.use(express.static(path.join(__dirname, "../frontend/dist")));

const resolvedPath = path.resolve(__dirname, "../frontend/dist/index.html");

app.get("*", (req, res) => {
  res.sendFile(resolvedPath);
});

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
