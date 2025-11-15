import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // in case you handle POST requests later

const API_KEY = process.env.NEWS_API_KEY;

if (!API_KEY) {
  console.error("ERROR: NEWS_API_KEY is not defined in .env");
  process.exit(1);
}

app.get("/api/news", async (req, res) => {
  try {
    const url = `https://newsapi.org/v2/top-headlines?country=us&pageSize=20&apiKey=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch news");

    const data = await response.json();
    res.json(data); // send data to frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "News fetch failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running → http://localhost:${PORT}`);
});
