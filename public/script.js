// public/script.js

document.addEventListener("DOMContentLoaded", () => {
  const apiKeyInput = document.getElementById("apiKey");
  const fileInput = document.getElementById("fileInput");
  const dropzone = document.getElementById("dropzone");
  const preview = document.getElementById("preview");
  const fileInfo = document.getElementById("fileInfo");
  const uploadBtn = document.getElementById("postBtn");
  const aiCaptionBtn = document.getElementById("aiCaptionBtn");
  const aiCaptionOutput = document.getElementById("aiCaptionOutput");
  const aiResults = document.getElementById("aiResults");
  const captionInput = document.getElementById("caption");

  let selectedFile;

  // Drag & Drop
  dropzone.addEventListener("click", () => fileInput.click());

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  function handleFile(file) {
    selectedFile = file;
    fileInfo.textContent = `Selected: ${file.name} (${Math.round(file.size / 1024)} KB)`;

    const reader = new FileReader();
    reader.onload = function (e) {
      preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%; max-height:200px;" />`;
    };
    reader.readAsDataURL(file);

    uploadBtn.disabled = false;
  }

  // Upload Button
  uploadBtn.addEventListener("click", async () => {
    if (!selectedFile) return alert("Please select a file first.");

    const reader = new FileReader();
    reader.onload = async function (e) {
      const base64 = e.target.result;

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64 }),
        });

        const data = await res.json();
        if (data.fileUrl) {
          alert("Upload successful!");
          console.log("Uploaded file URL:", data.fileUrl);
        } else {
          alert("Upload failed.");
        }
      } catch (err) {
        console.error(err);
        alert("Error uploading file.");
      }
    };
    reader.readAsDataURL(selectedFile);
  });

  // AI Caption Button
  aiCaptionBtn.addEventListener("click", async () => {
    const text = captionInput.value || "Sample prompt for AI captions";

    try {
      const res = await fetch("/api/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await res.json();
      if (data.captions) {
        aiResults.style.display = "block";
        aiCaptionOutput.value = data.captions.join("\n\n");
      } else {
        alert("AI caption generation failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating AI captions.");
    }
  });
});
