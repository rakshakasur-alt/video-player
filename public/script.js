document.addEventListener("DOMContentLoaded", async () => {
  const videoGrid = document.getElementById("videoGrid");

  try {
    const res = await fetch("/videos");
    const videos = await res.json();

    videos.forEach(video => {
      const card = document.createElement("div");
      card.className = "video-card";

      card.innerHTML = `
        <a href="player.html?id=${video.id}">
          <img src="${video.thumbnail}" alt="${video.name}">
          <h3>${video.name}</h3>
        </a>
      `;

      videoGrid.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading videos:", err);
  }
});
