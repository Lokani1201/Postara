// -----------------------------
// Select DOM elements
// -----------------------------
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const preview = document.getElementById('preview');
const fileInfo = document.getElementById('fileInfo');
const aiCaptionBtn = document.getElementById('aiCaptionBtn');
const aiResults = document.getElementById('aiResults');
const aiCaptionOutput = document.getElementById('aiCaptionOutput');
const captionInput = document.getElementById('caption');
const postBtn = document.getElementById('postBtn');
const buttonText = document.getElementById('buttonText');
const loadingSpinner = document.getElementById('loadingSpinner');
const platforms = document.querySelectorAll('.platform-checkbox');

let selectedFile = null;

// -----------------------------
// File Upload
// -----------------------------
dropzone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFiles);

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.style.borderColor = '#333';
});

dropzone.addEventListener('dragleave', e => {
  e.preventDefault();
  dropzone.style.borderColor = '#aaa';
});

dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.style.borderColor = '#aaa';
  const files = e.dataTransfer.files;
  handleFiles({ target: { files } });
});

function handleFiles(e) {
  selectedFile = e.target.files[0];
  if (!selectedFile) return;

  fileInfo.textContent = `Selected: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB)`;

  preview.innerHTML = '';
  if (selectedFile.type.startsWith('image/')) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(selectedFile);
    preview.appendChild(img);
  } else if (selectedFile.type.startsWith('video/')) {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(selectedFile);
    video.controls = true;
    preview.appendChild(video);
  }

  checkEnablePost();
}

// -----------------------------
// Enable Post Button
// -----------------------------
function checkEnablePost() {
  postBtn.disabled = !selectedFile || !captionInput.value.trim() || platforms.length === 0;
}

// -----------------------------
// AI Caption Generator
// -----------------------------
aiCaptionBtn.addEventListener('click', async () => {
  if (!selectedFile) {
    alert('Please upload a file first!');
    return;
  }

  aiResults.style.display = 'block';
  aiCaptionOutput.value = 'Generating...';

  try {
    const formData = new FormData();
    formData.append('file', selectedFile);

    const res = await fetch('/api/generate-caption', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data && data.caption) {
      aiCaptionOutput.value = data.caption;
    } else {
      aiCaptionOutput.value = 'AI could not generate a caption.';
    }
  } catch (err) {
    aiCaptionOutput.value = 'Error generating caption.';
    console.error(err);
  }
});

// -----------------------------
// Post Button Click
// -----------------------------
postBtn.addEventListener('click', async () => {
  if (!selectedFile) return;
  postBtn.disabled = true;
  loadingSpinner.style.display = 'inline-block';
  buttonText.textContent = 'Uploading...';

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('caption', captionInput.value);
  const selectedPlatforms = Array.from(platforms).filter(p => p.checked).map(p => p.value);
  formData.append('platforms', JSON.stringify(selectedPlatforms));

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      alert('Posted successfully!');
      captionInput.value = '';
      preview.innerHTML = '';
      fileInfo.textContent = '';
      selectedFile = null;
      platforms.forEach(p => (p.checked = false));
    } else {
      alert('Upload failed.');
      console.error(data.error);
    }
  } catch (err) {
    alert('Error posting file.');
    console.error(err);
  }

  buttonText.textContent = '🚀 Upload & Post';
  loadingSpinner.style.display = 'none';
  checkEnablePost();
});
