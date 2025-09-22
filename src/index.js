import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import routes from "./routes/index.js";

const app = express();
const corsOptions = {
  origin: ["*"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

// Static files (public/index.html, favicon, etc.)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use('/v1/api', routes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    db: {
      status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    },
  });
});


app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* eslint-disable no-undef */
const CONNECTION_URL = process.env.CONNECTION_URL;
const PORT = process.env.PORT || 8080;

mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected..."))
  .then(() =>
    app.listen(PORT, () => console.log(`Server Running on Port: ${PORT}`))
  )
  .catch((error) => console.log(`${error} did not connect`));