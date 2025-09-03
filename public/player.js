document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("id");

  const res = await fetch("/videos");
  const videos = await res.json();
  const video = videos.find(v => v.id == videoId);

  if (!video) {
    alert("Video not found!");
    return;
  }

  const container = document.getElementById("videoContainer");
  container.innerHTML = `
    <h2>${video.name}</h2>
    <video width="640" controls autoplay>
      <source src="/video/${video.id}" type="video/mp4">
      Your browser does not support the video tag.
    </video>
  `;
});
