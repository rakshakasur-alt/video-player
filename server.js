const express = require('express');
const fs = require('fs');
const path = require('path');
const { File } = require('megajs');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// Data file
const DATA_FILE = path.join(__dirname, 'data', 'videos.json');

// --- helpers ---
function loadVideos() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return data && data.trim() ? JSON.parse(data) : [];
  } catch (err) {
    console.error("❌ Error reading videos.json:", err);
    return [];
  }
}

function saveVideos(videos) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(videos, null, 2));
  } catch (err) {
    console.error("❌ Error saving videos.json:", err);
  }
}

// --- API: list videos ---
app.get('/videos', (req, res) => {
  res.json(loadVideos());
});

// --- API: add new video ---
app.post('/api/videos', (req, res) => {
  try {
    const { name, link, thumbnail } = req.body;
    if (!name || !link) {
      return res.status(400).json({ error: "Missing name or link" });
    }

    const videos = loadVideos();
    const newVideo = { id: Date.now(), name, link, thumbnail };
    videos.push(newVideo);
    saveVideos(videos);
    res.json(newVideo);
  } catch (err) {
    console.error("❌ Error adding video:", err);
    res.status(500).json({ error: "Failed to add video" });
  }
});

// --- Video streaming (Mega with range support) ---
app.get('/video/:id', async (req, res) => {
  const videos = loadVideos();
  const video = videos.find(v => v.id == req.params.id);

  if (!video) return res.status(404).send("Video not found");

  try {
    if (video.link.includes("mega.nz")) {
      const file = File.fromURL(video.link);
      await file.loadAttributes();
      const size = file.size;

      const range = req.headers.range;
      if (!range) {
        res.setHeader("Content-Length", size);
        res.setHeader("Content-Type", "video/mp4");
        file.download().pipe(res);
      } else {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : size - 1;
        const chunkSize = (end - start) + 1;

        res.writeHead(206, {
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize,
          "Content-Type": "video/mp4"
        });

        file.download({ start, end }).pipe(res);
      }
    } else {
      res.status(400).send("Unsupported link type (only Mega supported)");
    }
  } catch (err) {
    console.error("❌ Error streaming video:", err);
    res.status(500).send("Error streaming video");
  }
});

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
