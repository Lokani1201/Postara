// public/script.js

const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const fileInfo = document.getElementById("fileInfo");
const preview = document.getElementById("preview");

const postBtn = document.getElementById("postBtn");
const buttonText = document.getElementById("buttonText");
const loadingSpinner = document.getElementById("loadingSpinner");

const aiCaptionBtn = document.getElementById("aiCaptionBtn");
const aiCaptionOutput = document.getElementById("aiCaptionOutput");
const aiResults = document.getElementById("aiResults");

let uploadedFileUrl = "";

// --- Drag & Drop ---
dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});

dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
  fileInput.files = e.dataTransfer.files;
  handleFileUpload();
});

fileInput.addEventListener("change", handleFileUpload);

async function handleFileUpload() {
  if (!fileInput.files.length) return;

  const file = fileInput.files[0];
  fileInfo.textContent = `Uploading: ${file.name}`;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      uploadedFileUrl = data.url;
      fileInfo.textContent = `Uploaded: ${file.name}`;
      preview.innerHTML = `<img src="${uploadedFileUrl}" style="max-width:100%; max-height:300px;" />`;
      postBtn.disabled = false;
    } else {
      fileInfo.textContent = `Upload failed: ${data.error}`;
    }
  } catch (err) {
    console.error(err);
    fileInfo.textContent = "Upload error";
  }
}

// --- AI Caption Generator ---
aiCaptionBtn.addEventListener("click", async () => {
  if (!uploadedFileUrl) {
    alert("Upload a file first!");
    return;
  }

  aiCaptionOutput.value = "Generating captions...";
  aiResults.style.display = "block";

  try {
    const res = await fetch("/api/generate-caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: uploadedFileUrl }),
    });

    const data = await res.json();
    if (res.ok) {
      aiCaptionOutput.value = data.captions.join("\n\n");
    } else {
      aiCaptionOutput.value = `Error: ${data.error}`;
    }
  } catch (err) {
    console.error(err);
    aiCaptionOutput.value = "Error generating captions";
  }
});
