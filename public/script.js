// Select elements
const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const fileInfo = document.getElementById("fileInfo");
const preview = document.getElementById("preview");
const aiCaptionBtn = document.getElementById("aiCaptionBtn");
const aiCaptionOutput = document.getElementById("aiCaptionOutput");
const captionInput = document.getElementById("caption");

// --- Drag & Drop ---
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", (e) => e.preventDefault());
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  if (e.dataTransfer.files.length > 0) {
    fileInput.files = e.dataTransfer.files;
    showFile(fileInput.files[0]);
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    showFile(e.target.files[0]);
  }
});

function showFile(file) {
  fileInfo.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
  preview.innerHTML = "";
  const reader = new FileReader();
  reader.onload = (e) => {
    const ext = file.name.split('.').pop().toLowerCase();
    let element;
    if (["jpg","jpeg","png","gif"].includes(ext)) {
      element = document.createElement("img");
      element.src = e.target.result;
      element.style.maxWidth = "300px";
    } else if (["mp4","webm","ogg"].includes(ext)) {
      element = document.createElement("video");
      element.src = e.target.result;
      element.controls = true;
      element.style.maxWidth = "300px";
    } else {
      element = document.createElement("p");
      element.textContent = "Preview not available";
    }
    preview.appendChild(element);
  };
  reader.readAsDataURL(file);
}

// --- AI Caption Generation ---
aiCaptionBtn.addEventListener("click", async () => {
  const text = captionInput.value.trim();
  if (!text) {
    alert("Please write some text or leave a short description!");
    return;
  }

  aiCaptionOutput.value = "Generating captions...";
  try {
    const response = await fetch("/api/generate-caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await response.json();
    aiCaptionOutput.value = data.captions.join("\n") || "No captions generated";
  } catch (err) {
    console.error(err);
    aiCaptionOutput.value = "Error generating captions";
  }
});

// --- Upload Button ---
const postBtn = document.getElementById("postBtn");
postBtn.addEventListener("click", async () => {
  if (!fileInput.files[0]) {
    alert("Please select a file first!");
    return;
  }

  const formData = new FormData();
  formData.append("file", fileInput.files[0]);

  postBtn.disabled = true;
  postBtn.textContent = "Uploading...";

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    alert("Upload successful! URL: " + data.url);
  } catch (err) {
    console.error(err);
    alert("Upload failed");
  } finally {
    postBtn.disabled = false;
    postBtn.textContent = "🚀 Upload & Post";
  }
});
