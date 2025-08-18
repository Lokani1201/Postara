// === CONFIGURATION ===
const AYRSHARE_API_KEY = '57EE17FA-3ADC4081-903F57CB-65F688CA';

// DOM Elements
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

let selectedFile = null;
let aiCaptions = [];

// === EVENT LISTENERS ===
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    fileInput.files = e.dataTransfer.files;
    handleFileSelect({ target: fileInput });
  }
});
aiCaptionBtn.addEventListener('click', generateAICaptions);
postBtn.addEventListener('click', uploadAndPost);

// === FUNCTIONS ===
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) return alert('Only JPG, PNG, MP4 supported.');
  if (file.size > maxSize) return alert('Max file size 10MB.');

  selectedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);

  if (file.type.startsWith('image/')) {
    mediaPreview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Preview" style="max-height:200px;">`;
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

async function generateAICaptions() {
  if (!selectedFile) return alert('Upload a media file first.');
  aiCaptionBtn.disabled = true;
  aiCaptionBtn.textContent = 'Generating...';

  try {
    const prompt = `Generate 5 short captions for a ${selectedFile.type.startsWith('image') ? 'photo' : 'video'}. Use emojis, hashtags, different tones. Separate with "---"`;
    const res = await fetch('/api/generate-caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await res.json();
    if (!data.captions) throw new Error('No captions returned');

    aiCaptions = data.captions.split('---').map(c => c.trim()).filter(c => c);
    captionOutput.innerHTML = aiCaptions.map((c,i) => `<div class="caption-item"><p>${c}</p><button type="button" onclick="useCaption(${i})">Use</button></div>`).join('');
  } catch (err) {
    console.error(err);
    alert('Failed to generate captions.');
  } finally {
    aiCaptionBtn.disabled = false;
    aiCaptionBtn.textContent = '✨ Generate 5 Captions';
  }
}

function useCaption(i) {
  captionInput.value = aiCaptions[i];
}

async function uploadAndPost() {
  if (!selectedFile) return alert('Upload a media file first.');
  const selectedPlatforms = Array.from(platformCheckboxes).filter(cb=>cb.checked).map(cb=>cb.value);
  if (selectedPlatforms.length === 0) return alert('Select at least one platform.');

  postBtn.disabled = true;
  postBtn.textContent = 'Uploading...';

  try {
    const formData = new FormData();
    formData.append('media', selectedFile);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    formData.append('post', captionInput.value || 'Check out this post!');

    const res = await fetch('https://api.ayrshare.com/upload', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${AYRSHARE_API_KEY}` },
      body: formData
    });

    const result = await res.json();

    if (result.status === 'error') throw new Error(result.message || 'Upload failed');

    alert(`✅ Posted successfully to ${selectedPlatforms.join(', ')}!`);
  } catch (err) {
    console.error(err);
    alert('❌ Upload failed. See console.');
  } finally {
    postBtn.disabled = false;
    postBtn.textContent = 'Upload & Post';
  }
}

