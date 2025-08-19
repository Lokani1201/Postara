// Elements
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");
const fileInfo = document.getElementById("fileInfo");

// Drag & Drop
dropzone.addEventListener("click", () => fileInput.click());
dropzone.addEventListener("dragover", (e) => e.preventDefault());
dropzone.addEventListener("drop", async (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  if (files.length > 0) await uploadFile(files[0]);
});

// File input change
fileInput.addEventListener("change", async () => {
  if (fileInput.files.length > 0) await uploadFile(fileInput.files[0]);
});

// Upload function
async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  fileInfo.textContent = "Uploading...";
  preview.innerHTML = "";

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });
    const data = await response.json();

    if (response.ok) {
      fileInfo.textContent = `Uploaded: ${file.name}`;
      
      // Show preview
      if (file.type.startsWith("image/")) {
        preview.innerHTML = `<img src="${data.url}" style="max-width: 100%; border-radius: 8px;" />`;
      } else if (file.type.startsWith("video/")) {
        preview.innerHTML = `<video controls style="max-width: 100%; border-radius: 8px;">
          <source src="${data.url}" type="${file.type}" />
        </video>`;
      }

    } else {
      fileInfo.textContent = `Error: ${data.error}`;
    }
  } catch (err) {
    console.error(err);
    fileInfo.textContent = "Upload failed. Try again.";
  }
}
