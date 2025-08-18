// === DOM Elements ===
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');
const mediaPreview = document.getElementById('media-preview');
const platformCheckboxes = document.querySelectorAll('.platform-checkbox');
const uploadBtn = document.getElementById('upload-btn');
const aiCaptionBtn = document.getElementById('ai-caption-btn');
const captionOutput = document.getElementById('caption-output');
const captionInput = document.getElementById('caption-input');
const postBtn = document.getElementById('post-btn');

// === State ===
let selectedFile = null;
let aiCaptions = [];

// === Event Listeners ===
// Click upload area
uploadArea.addEventListener('click', () => fileInput.click());

// File selected
fileInput.addEventListener('change', handleFileSelect);

// Drag & drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    fileInput.files = e.dataTransfer.files;
    handleFileSelect({ target: fileInput });
  }
});

// AI Caption button
aiCaptionBtn.addEventListener('click', generateAICaptions);

// Upload & Post button
postBtn.addEventListener('click', uploadAndPost);

// === Functions ===
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    alert('Only JPG, PNG, MP4 supported.');
    return;
  }

  if (file.size > maxSize) {
    alert('File too large (max 10MB).');
    return;
  }

  selectedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);

  // Preview
  if (file.type.startsWith('image/')) {
    mediaPreview.innerHTML = `<img src="${URL.createObjectURL(file)}" style="max-height:200px;">`;
  } else {
    mediaPreview.innerHTML = `<video controls style="max-height:200px;"><source src="${URL.createObjectURL(file)}" type="${file.type}"></video>`;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// Generate AI captions
async function generateAICaptions() {
  if (!selectedFile) return alert('Upload a file first.');
  
  aiCaptionBtn.disabled = true;
  aiCaptionBtn.textContent = 'Generating...';

  try {
    const formData = new FormData();
    formData.append('type', selectedFile.type.startsWith('image') ? 'image' : 'video');

    const res = await fetch('/api/generate-caption', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    aiCaptions = data.captions.split('---').map(c => c.trim()).filter(c => c);
    captionOutput.innerHTML = aiCaptions.map((c, i) => 
      `<div><p>${c}</p><button type="button" onclick="useCaption(${i})">Use</button></div>`
    ).join('');
  } catch (err) {
    console.error(err);
    alert('Failed to generate captions.');
  } finally {
    aiCaptionBtn.disabled = false;
    aiCaptionBtn.textContent = '✨ Generate 5 Captions';
  }
}

function useCaption(index) {
  captionInput.value = aiCaptions[index];
}

// Upload & post
async function uploadAndPost() {
  if (!selectedFile) return alert('Upload a file first.');

  const selectedPlatforms = Array.from(platformCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (!selectedPlatforms.length) return alert('Select at least one platform.');

  postBtn.disabled = true;
  postBtn.textContent = 'Uploading...';

  try {
    const formData = new FormData();
    formData.append('media', selectedFile);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    formData.append('caption', captionInput.value || 'Check this out!');

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error);

    alert(`✅ Posted to ${selectedPlatforms.join(', ')}!`);
  } catch (err) {
    console.error(err);
    alert('❌ Failed to post.');
  } finally {
    postBtn.disabled = false;
    postBtn.textContent = '🚀 Upload & Post';
  }
}
