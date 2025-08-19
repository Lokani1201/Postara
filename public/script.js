const aiCaptionBtn = document.getElementById("aiCaptionBtn");
const aiCaptionOutput = document.getElementById("aiCaptionOutput");
const aiResults = document.getElementById("aiResults");

aiCaptionBtn.addEventListener("click", async () => {
  const text = document.getElementById("caption").value || "Generate caption for this post";
  aiResults.style.display = "block";
  aiCaptionOutput.value = "Generating...";

  try {
    const response = await fetch("/api/generate-caption", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (response.ok) {
      aiCaptionOutput.value = data.captions.join("\n\n");
    } else {
      aiCaptionOutput.value = `Error: ${data.error}`;
    }
  } catch (err) {
    console.error(err);
    aiCaptionOutput.value = "Error generating captions. Try again.";
  }
});
