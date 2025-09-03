document.getElementById("addForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const link = document.getElementById("link").value;
  const thumbnail = document.getElementById("thumbnail").value;

  const res = await fetch("/api/videos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, link, thumbnail })
  });

  const msg = document.getElementById("msg");
  if (res.ok) {
    msg.textContent = "✅ Video added successfully!";
  } else {
    msg.textContent = "❌ Error adding video!";
  }
});
