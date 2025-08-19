// === CONFIGURATION ===
// Replace with your Ayrshare API Key
const AYRSHARE_API_KEY = 'sk_live_YOUR_AYRSHARE_KEY_HERE';

// DOM Elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const mediaPreview = document.getElementById('media-preview');
const aiCaptionBtn = document.getElementById('ai-caption-btn');
const captionOutput = document.getElementById('caption-output');
const captionInput = document.getElementById('caption-input');
const postBtn = document.getElementById('post-btn');
const platformCheckboxes = document.querySelectorAll('.platform-checkbox');

// State
let selectedFile = null;
let aiCaptions = [];

// === EVENT LISTENERS ===
if (uploadArea) {
  uploadArea.addEventListener('click', () => fileInput.click());

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
}

if (fileInput) {
  fileInput.addEventListener('change', handleFileSelect);
}

if (aiCaptionBtn) {
  aiCaptionBtn.addEventListener('click', generateAICaptions);
}

if (postBtn) {
  postBtn.addEventListener('click', uploadAndPost);
}

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

  // Preview
  if (file.type.startsWith('image/')) {
    if (!mediaPreview) {
      console.error('media-preview not found');
      return;
    }
    mediaPreview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Preview" style="max-height: 200px;">`;
  } else if (file.type.startsWith('video/')) {
    if (!mediaPreview) {
      console.error('media-preview not found');
      return;
    }
    mediaPreview.innerHTML = `<video controls style="max-height: 200px;"><source src="${URL.createObjectURL(file)}" type="${file.type}">Your browser does not support the video tag.</video>`;
  }
}

async function generateAICaptions() {
  if (!selectedFile) {
    alert('Please upload a media file first.');
    return;
  }

  if (!aiCaptionBtn) return;

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
    if (captionOutput) {
      captionOutput.innerHTML = aiCaptions
        .map((caption, i) => `<div class="caption-item"><p>${caption}</p><button type="button" onclick="useCaption(${i})">Use</button></div>`)
        .join('');
    } else {
      console.error('caption-output not found');
    }
  } catch (error) {
    console.error('AI Error:', error);
    alert('Failed to generate captions. Try again.');
  } finally {
    if (aiCaptionBtn) {
      aiCaptionBtn.disabled = false;
      aiCaptionBtn.innerHTML = '✨ Generate 5 Captions';
    }
  }
}

function useCaption(index) {
  if (captionInput) {
    captionInput.value = aiCaptions[index];
  }
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

  if (!postBtn) return;

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

    alert(`Posted successfully to ${selectedPlatforms.join(', ')}!`);
  } catch (error) {
    console.error('Post Error:', error);
    alert('Failed to post. Check console for details.');
  } finally {
    if (postBtn) {
      postBtn.disabled = false;
      postBtn.innerHTML = 'Upload & Post';
    }
  }
}
