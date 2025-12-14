import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/news", async (req, res) => {
  try {
    const { category, q } = req.query;

    let url = `https://newsapi.org/v2/top-headlines?apiKey=${NEWS_API_KEY}&pageSize=20`;

    if (category) {
      if (category === "local") {
        url += `&country=pk`; // Pakistan news
      } else {
        url += `&category=${category}&country=us`;
      }
    } 
    else if (q) {
      url += `&q=${encodeURIComponent(q)}&language=en`;
    } 
    else {
      url += `&category=general&country=us`;
    }

    const r = await fetch(url);
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
