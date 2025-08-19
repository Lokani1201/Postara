// public/script.js

const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const fileInfo = document.getElementById("fileInfo");
const preview = document.getElementById("preview");
const aiCaptionBtn = document.getElementById("aiCaptionBtn");
const aiCaptionOutput = document.getElementById("aiCaptionOutput");
const captionBox = document.getElementById("caption");
const postBtn = document.getElementById("postBtn");

let uploadedFileUrl = null;

// =====================
// Drag & Drop / File Selection
// =====================
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", (e) => e.preventDefault());
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  handleFile(file);
});

function handleFile(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Data = e.target.result.split(",")[1];
    fileInfo.textContent = `Uploading: ${file.name}`;
    preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px;" />`;

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileData: base64Data }),
      });

      const data = await res.json();
      if (res.ok) {
        uploadedFileUrl = data.url;
        fileInfo.textContent = `Uploaded: ${file.name}`;
        postBtn.disabled = false;
      } else {
        fileInfo.textContent = `Upload error: ${data.error}`;
      }
    } catch (err) {
      fileInfo.textContent = "Upload failed";
      console.error(err);
    }
  };

  reader.readAsDataURL(file);
}

// =====================
// AI Caption Generator
// =====================
aiCaptionBtn.addEventListener("click", async () => {
  if (!uploadedFileUrl) {
    alert("Please upload a file first!");
    return;
  }

  aiCaptionOutput.value = "Generating captions...";
  try {
    const res = await fetch("/api/generate-caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl: uploadedFileUrl }),
    });

    const data = await res.json();
    if (res.ok) {
      aiCaptionOutput.value = data.captions.join("\n\n");
    } else {
      aiCaptionOutput.value = `Error: ${data.error}`;
    }
  } catch (err) {
    aiCaptionOutput.value = "Caption generation failed";
    console.error(err);
  }
});
