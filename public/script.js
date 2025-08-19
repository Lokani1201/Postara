// Get elements
const aiButton = document.getElementById("aiCaptionBtn");
const aiResults = document.getElementById("aiResults");
const aiOutput = document.getElementById("aiCaptionOutput");
const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const preview = document.getElementById("preview");

// Handle AI Caption generation
aiButton.addEventListener("click", async () => {
  const text = document.getElementById("caption").value.trim();
  if (!text) return alert("Write something first!");

  aiButton.disabled = true;
  aiButton.innerText = "Generating...";

  try {
    const res = await fetch("/api/generate-caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    aiOutput.value = data.caption || "Try again";
    aiResults.style.display = "block";
  } catch (err) {
    console.error(err);
    alert("AI Caption failed. Check console.");
  } finally {
    aiButton.disabled = false;
    aiButton.innerText = "✨ Generate 5 Captions";
  }
});

// Handle file upload
dropzone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Preview
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; max-height: 200px;">`;
  };
  reader.readAsDataURL(file);

  // Upload
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.url) {
      alert("Upload successful!");
    } else {
      alert("Upload failed.");
    }
  } catch (err) {
    console.error(err);
    alert("Upload error. Check console.");
  }
});
