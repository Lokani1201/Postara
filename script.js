// DOM elements
const apiKeyInput = document.getElementById('apiKey');
const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const preview = document.getElementById('preview');
const fileInfo = document.getElementById('fileInfo');
const captionInput = document.getElementById('caption');
const postBtn = document.getElementById('postBtn');
const buttonText = document.getElementById('buttonText');
const loadingSpinner = document.getElementById('loadingSpinner');
const statusDiv = document.getElementById('status');
const platformCards = document.querySelectorAll('.platform-card');
const platformCheckboxes = document.querySelectorAll('.platform-checkbox');
const platformCount = document.getElementById('platformCount');

// State variables
let currentFile = null;
let isUploading = false;

// Initialize event listeners
function initEventListeners() {
  // API key input
  apiKeyInput.addEventListener('input', updatePostButtonState);

  // File input and dropzone
  dropzone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  // Drag and drop
  dropzone.addEventListener('dragover', handleDragOver);
  dropzone.addEventListener('dragleave', handleDragLeave);
  dropzone.addEventListener('drop', handleDrop);

  // Caption input
  captionInput.addEventListener('input', updatePostButtonState);

  // Platform selection
  platformCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const checkbox = card.querySelector('input');
      checkbox.checked = !checkbox.checked;
      updatePlatformCard(card, checkbox.checked);
      updatePostButtonState();
    });
  });

  platformCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const card = e.target.closest('.platform-card');
      updatePlatformCard(card, e.target.checked);
      updatePostButtonState();
    });
  });

  // Post button
  postBtn.addEventListener('click', handlePost);
}

// Drag and drop handlers
function handleDragOver(e) {
  e.preventDefault();
  dropzone.style.borderColor = 'rgba(255, 255, 255, 0.7)';
  dropzone.style.background = 'rgba(255, 255, 255, 0.2)';
  dropzone.style.transform = 'translateY(-5px)';
}

function handleDragLeave(e) {
  e.preventDefault();
  dropzone.style.borderColor = 'rgba(255, 255, 255, 0.4)';
  dropzone.style.background = 'rgba(255, 255, 255, 0.05)';
  dropzone.style.transform = 'translateY(0)';
}

function handleDrop(e) {
  e.preventDefault();
  dropzone.style.borderColor = 'rgba(255, 255, 255, 0.4)';
  dropzone.style.background = 'rgba(255, 255, 255, 0.05)';
  dropzone.style.transform = 'translateY(0)';

  if (e.dataTransfer.files.length > 0) {
    handleFile(e.dataTransfer.files[0]);
  }
}

// File handling
function handleFile(file) {
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    setStatus('❌ File too large. Maximum size is 10MB.', 'error');
    currentFile = null;
    hideFileInfo();
    updatePostButtonState();
    return;
  }

  // Check file type
  if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
    setStatus('❌ Unsupported file type. Please upload an image or video.', 'error');
    currentFile = null;
    hideFileInfo();
    updatePostButtonState();
    return;
  }

  currentFile = file;
  showFileInfo(file);
  
  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    preview.innerHTML = '';
    if (file.type.startsWith('image/')) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview" />`;
    } else if (file.type.startsWith('video/')) {
      preview.innerHTML = `<video controls><source src="${e.target.result}" type="${file.type}"></video>`;
    }
    
    setStatus(`✅ ${file.name} ready to upload (${formatFileSize(file.size)})`, 'success');
    updatePostButtonState();
  };
  
  reader.onerror = () => {
    setStatus('❌ Error reading file. Please try another file.', 'error');
    currentFile = null;
    hideFileInfo();
    updatePostButtonState();
  };
  
  reader.readAsDataURL(file);
}

function showFileInfo(file) {
  fileInfo.innerHTML = `
    <div>Selected: <strong>${file.name}</strong></div>
    <div>Type: <strong>${file.type}</strong></div>
    <div>Size: <strong>${formatFileSize(file.size)}</strong></div>
  `;
  fileInfo.classList.add('show');
}

function hideFileInfo() {
  fileInfo.classList.remove('show');
  preview.innerHTML = '';
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Platform card styling
function updatePlatformCard(card, isSelected) {
  if (isSelected) {
    card.classList.add('selected');
  } else {
    card.classList.remove('selected');
  }
}

// Post button state
function updatePostButtonState() {
  const hasApiKey = apiKeyInput.value.trim() !== '';
  const hasFile = currentFile !== null;
  const hasCaption = captionInput.value.trim() !== '';
  const hasPlatform = document.querySelectorAll('.platform-checkbox:checked').length > 0;

  postBtn.disabled = !(hasApiKey && hasFile && hasCaption && hasPlatform);
}

// Status messages
function setStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = type;
  statusDiv.style.display = 'block';
  
  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      if (statusDiv.className === 'success') {
        statusDiv.style.display = 'none';
      }
    }, 5000);
  }
}

// Post handler
async function handlePost() {
  if (postBtn.disabled || isUploading) return;

  const apiKey = apiKeyInput.value.trim();
  const caption = captionInput.value.trim();
  const platforms = Array.from(document.querySelectorAll('.platform-checkbox:checked'))
    .map(checkbox => checkbox.value);

  // Show loading state
  isUploading = true;
  buttonText.textContent = 'Processing...';
  loadingSpinner.style.display = 'block';
  postBtn.disabled = true;
  setStatus('⏳ Uploading your media to Ayrshare...', 'info');

  try {
    // First upload media
    const formData = new FormData();
    formData.append('file', currentFile);

    const uploadResponse = await fetch('https://app.ayrshare.com/api/media/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    const uploadData = await uploadResponse.json();

    if (!uploadData.url) {
      throw new Error(uploadData.message || 'Failed to upload media');
    }

    setStatus('✅ Media uploaded successfully! Preparing your post...', 'success');

    // Then post to platforms
    const postResponse = await fetch('https://app.ayrshare.com/api/post', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        post: caption,
        platforms: platforms,
        mediaUrls: [uploadData.url]
      })
    });

    const postData = await postResponse.json();

    if (postData.status === 'success') {
      let successMessage = '🎉 Successfully posted to:\n';
      platforms.forEach(platform => {
        successMessage += `• ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n`;
      });
      setStatus(successMessage, 'success');
      buttonText.textContent = 'Posted Successfully!';
      
      // Reset form after 3 seconds
      setTimeout(() => {
        resetForm();
      }, 3000);
    } else if (postData.errors) {
      const errors = postData.errors.map(e => {
        return `• ${e.platform || 'Unknown platform'}: ${e.message || 'Unknown error'}`;
      }).join('\n');
      setStatus(`❌ Some posts failed:\n${errors}`, 'error');
      buttonText.textContent = 'Try Again';
    } else {
      setStatus(`❌ Post failed: ${postData.message || postData.error || 'Unknown error'}`, 'error');
      buttonText.textContent = 'Try Again';
    }
  } catch (error) {
    console.error('Posting error:', error);
    setStatus(`❌ Error: ${error.message}`, 'error');
    buttonText.textContent = 'Try Again';
  } finally {
    loadingSpinner.style.display = 'none';
    isUploading = false;
    updatePostButtonState();
  }
}

// Reset form
function resetForm() {
  currentFile = null;
  fileInput.value = '';
  captionInput.value = '';
  preview.innerHTML = '';
  fileInfo.classList.remove('show');
  document.querySelectorAll('.platform-checkbox').forEach(checkbox => {
    checkbox.checked = false;
    const card = checkbox.closest('.platform-card');
    card.classList.remove('selected');
  });
  buttonText.textContent = '🚀 Upload & Post';
  setStatus('', '');
  updatePostButtonState();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  platformCount.textContent = platformCheckboxes.length;
});