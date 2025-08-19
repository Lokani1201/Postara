// api/upload.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileName, fileData } = req.body;
    if (!fileName || !fileData) {
      return res.status(400).json({ error: "No file data provided" });
    }

    // Your Ayrshare API key
    const API_KEY = process.env.AYRSHARE_API_KEY;

    // Upload file to Ayrshare (base64 format)
    const response = await fetch("https://api.ayrshare.com/v1/media", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName: fileName,
        fileData: fileData, // base64 string
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || "Upload failed" });
    }

    // Return the URL of uploaded file
    return res.status(200).json({ url: data.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
