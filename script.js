// === CONFIGURATION ===
// Replace with your Ayrshare API Key (⚠️ for production, move this to backend!)
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

// State
let selectedFile = null;
let aiCaptions = [];

// === EVENT LISTENERS ===
// Upload Area Click
uploadArea.addEventListener('click', () => fileInput.click());

// File Selected
fileInput.addEventListener('change', handleFileSelect);

// Drag & Drop
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

// AI Caption Button
aiCaptionBtn.addEventListener('click', generateAICaptions);

// Upload & Post Button
postBtn.addEventListener('click', uploadAndPost);

// === FUNCTIONS ===
function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file type and size
  const validTypes = ['image/jpeg', 'image/png', 'video/mp4'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    alert('Only images (JPG, PNG) and videos (MP4) are supported.');
    return;
  }

  if (file.size > maxSize) {
    alert('File is too large. Maximum size is 10MB.');
    return;
  }

  selectedFile = file;
  fileName.textContent = file.name;
  fileSize.textContent = formatFileSize(file.size);

  // Preview
  if (file.type.startsWith('image/')) {
    mediaPreview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Preview" style="max-height: 200px;">`;
  } else if (file.type.startsWith('video/')) {
    mediaPreview.innerHTML = `<video controls style="max-height: 200px;"><source src="${URL.createObjectURL(file)}" type="${file.type}">Your browser does not support the video tag.</video>`;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function generateAICaptions() {
  if (!selectedFile) {
    alert('Please upload a media file first.');
    return;
  }

  aiCaptionBtn.disabled = true;
  aiCaptionBtn.innerHTML = 'Generating...';

  try {
    const prompt = `Generate 5 short, engaging captions for a ${selectedFile.type.startsWith('image') ? 'photo' : 'video'} post. Use emojis, hashtags, and different tones (funny, serious, motivational). Each caption should be 1–2 sentences. Separate them with "---"`;

    const response = await fetch('/api/generate-caption', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    aiCaptions = data.captions.split('---').map(c => c.trim()).filter(c => c);
    captionOutput.innerHTML = aiCaptions
      .map((caption, i) => `<div class="caption-item"><p>${caption}</p><button type="button" onclick="useCaption(${i})">Use</button></div>`)
      .join('');
  } catch (error) {
    console.error('AI Error:', error);
    alert('Failed to generate captions. Try again.');
  } finally {
    aiCaptionBtn.disabled = false;
    aiCaptionBtn.innerHTML = '✨ Generate 5 Captions';
  }
}

function useCaption(index) {
  captionInput.value = aiCaptions[index];
}

async function uploadAndPost() {
  if (!selectedFile) {
    alert('Please upload a media file first.');
    return;
  }

  const selectedPlatforms = Array.from(platformCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  if (selectedPlatforms.length === 0) {
    alert('Please select at least one platform.');
    return;
  }

  postBtn.disabled = true;
  postBtn.innerHTML = 'Uploading...';

  try {
    // Step 1: Upload to Ayrshare
    const formData = new FormData();
    formData.append('media', selectedFile);
    formData.append('platforms', JSON.stringify(selectedPlatforms));
    formData.append('post', captionInput.value || 'Check out this post!');

    const response = await fetch('https://api.ayrshare.com/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AYRSHARE_API_KEY}`
      },
      body: formData
    });

    const result = await response.json();

    if (result.status === 'error') {
      throw new Error(result.message);
    }

    alert(`✅ Posted successfully to ${selectedPlatforms.join(', ')}!`);
  } catch (error) {
    console.error('Post Error:', error);
    alert('❌ Failed to post. Check console for details.');
  } finally {
    postBtn.disabled = false;
    postBtn.innerHTML = 'Upload & Post';
  }
}
