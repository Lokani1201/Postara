// --- Select elements ---
const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const postBtn = document.getElementById("postBtn");
const captionInput = document.getElementById("caption");
const aiBtn = document.getElementById("aiCaptionBtn");
const aiOutput = document.getElementById("aiCaptionOutput");
const aiResults = document.getElementById("aiResults");

// --- Drag & Drop ---
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", (e) => e.preventDefault());
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  fileInput.files = e.dataTransfer.files;
});

// --- Enable Post Button when file selected ---
fileInput.addEventListener("change", () => {
  if (fileInput.files.length > 0) postBtn.disabled = false;
});

// --- Upload Button ---
postBtn.addEventListener("click", async () => {
  if (fileInput.files.length === 0) return alert("Select a file first");

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);
  formData.append("caption", captionInput.value);

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) alert("Upload successful!");
    else alert("Upload failed: " + data.message);
  } catch (err) {
    console.error(err);
    alert("Upload error");
  }
});

// --- AI Caption Button ---
aiBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Select a file first");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/generate-caption", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.captions) {
      aiOutput.value = data.captions.join("\n");
      aiResults.style.display = "block";
    } else {
      alert("AI generation failed");
    }
  } catch (err) {
    console.error(err);
    alert("AI generation error");
  }
});

