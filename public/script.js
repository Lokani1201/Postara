// Select elements
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const preview = document.getElementById("preview");
const aiCaptionBtn = document.getElementById("aiCaptionBtn");
const aiResults = document.getElementById("aiResults");
const aiCaptionOutput = document.getElementById("aiCaptionOutput");
const captionInput = document.getElementById("caption");
const postBtn = document.getElementById("postBtn");
const status = document.getElementById("status");
const platformCheckboxes = document.querySelectorAll(".platform-checkbox");

let uploadedFile = null;

// Handle drag & drop
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.style.borderColor = "#007bff";
});
dropzone.addEventListener("dragleave", (e) => {
  e.preventDefault();
  dropzone.style.borderColor = "#ccc";
});
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.style.borderColor = "#ccc";
  if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) handleFile(e.target.files[0]);
});

// Handle file
function handleFile(file) {
  uploadedFile = file;
  fileInfo.textContent = `${file.name} (${Math.round(file.size / 1024)} KB)`;
  preview.innerHTML = "";
  if (file.type.startsWith("image/")) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  } else if (file.type.startsWith("video/")) {
    const video = document.createElement("video");
    video.src = URL.createObjectURL(file);
    video.controls = true;
    preview.appendChild(video);
  }
  checkPostBtn();
}

// Enable post button if conditions met
function checkPostBtn() {
  const anyPlatformSelected = Array.from(platformCheckboxes).some(cb => cb.checked);
  postBtn.disabled = !uploadedFile || !anyPlatformSelected;
}

// Platform checkbox change
platformCheckboxes.forEach(cb => cb.addEventListener("change", checkPostBtn));

// AI caption button
aiCaptionBtn.addEventListener("click", async () => {
  if (!uploadedFile) {
    alert("Please upload a file first.");
    return;
  }
  aiResults.style.display = "block";
  aiCaptionOutput.value = "Generating captions...";
  try {
    const formData = new FormData();
    formData.append("file", uploadedFile);
    const res = await fetch("/api/generate-caption", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    if (data.captions) {
      aiCaptionOutput.value = data.captions.join("\n\n");
    } else {
      aiCaptionOutput.value = "No captions generated. Try again.";
    }
  } catch (err) {
    aiCaptionOutput.value = "Error generating captions.";
    console.error(err);
  }
});

// Post button click
postBtn.addEventListener("click", async () => {
  if (!uploadedFile) return;
  const selectedPlatforms = Array.from(platformCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  const postData = new FormData();
  postData.append("file", uploadedFile);
  postData.append("caption", captionInput.value);
  postData.append("platforms", JSON.stringify(selectedPlatforms));

  postBtn.disabled = true;
  status.textContent = "Uploading and posting...";

  try {
    const res = await fetch("/api/upload", {
      method: "POST",
      body: postData
    });
    const data = await res.json();
    if (data.success) {
      status.textContent = "Posted successfully!";
    } else {
      status.textContent = "Error posting: " + data.message;
    }
  } catch (err) {
    console.error(err);
    status.textContent = "Error posting file.";
  } finally {
    postBtn.disabled = false;
  }
});
