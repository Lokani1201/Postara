// Replace this with your Ayrshare API key
const API_KEY = "57EE17FA-3ADC4081-903F57CB-65F688CA";

const apiKeyInput = document.getElementById("apiKey");
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const fileInfo = document.getElementById("fileInfo");
const postBtn = document.getElementById("postBtn");
const aiCaptionBtn = document.getElementById("aiCaptionBtn");
const aiResults = document.getElementById("aiResults");
const aiCaptionOutput = document.getElementById("aiCaptionOutput");

let selectedFile = null;

// Disable API input
apiKeyInput.value = API_KEY;
apiKeyInput.disabled = true;

// Dropzone events
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", (e) => e.preventDefault());
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener("change", (e) => handleFile(e.target.files[0]));

function handleFile(file) {
  selectedFile = file;
  preview.innerHTML = "";
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  img.style.maxWidth = "200px";
  img.style.marginTop = "10px";
  preview.appendChild(img);
  fileInfo.textContent = `File: ${file.name} (${Math.round(file.size / 1024)} KB)`;
  postBtn.disabled = false;
}

// Upload & Post
postBtn.addEventListener("click", async () => {
  if (!selectedFile) return alert("No file selected!");

  postBtn.disabled = true;
  postBtn.textContent = "Uploading...";

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      headers: {
        "Authorization": `Bearer ${API_KEY}`
      }
    });
    const data = await res.json();
    alert("Upload successful!");
  } catch (err) {
    console.error(err);
    alert("Upload failed.");
  } finally {
    postBtn.disabled = false;
    postBtn.textContent = "🚀 Upload & Post";
  }
});

// AI Caption Generator
aiCaptionBtn.addEventListener("click", async () => {
  if (!selectedFile) return alert("Upload a file first!");

  aiCaptionBtn.disabled = true;
  aiCaptionBtn.textContent = "Generating...";

  try {
    const res = await fetch("/api/generate-caption", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        filename: selectedFile.name
      })
    });
    const data = await res.json();
    aiResults.style.display = "block";
    aiCaptionOutput.value = data.caption || "No caption generated.";
  } catch (err) {
    console.error(err);
    alert("Caption generation failed.");
  } finally {
    aiCaptionBtn.disabled = false;
    aiCaptionBtn.textContent = "✨ Generate 5 Captions";
  }
});
