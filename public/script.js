// Select DOM elements
const aiCaptionBtn = document.getElementById("aiCaptionBtn");
const aiResults = document.getElementById("aiResults");
const aiCaptionOutput = document.getElementById("aiCaptionOutput");

// AI Caption button click
aiCaptionBtn.addEventListener("click", async () => {
  const captionText = document.getElementById("caption").value;

  if (!captionText) {
    alert("Please write a base text in the caption box first.");
    return;
  }

  aiCaptionBtn.disabled = true;
  aiCaptionBtn.textContent = "✨ Generating...";

  try {
    const response = await fetch("/api/generate-caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: captionText })
    });

    const data = await response.json();

    if (data.error) {
      alert("Error: " + data.error);
    } else {
      aiResults.style.display = "block";
      aiCaptionOutput.value = data.captions.join("\n\n");
    }
  } catch (err) {
    console.error(err);
    alert("Failed to generate captions. Check console for details.");
  } finally {
    aiCaptionBtn.disabled = false;
    aiCaptionBtn.textContent = "✨ Generate 5 Captions";
  }
});
