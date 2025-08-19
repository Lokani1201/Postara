// api/upload.js

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { file } = req.body; // Expecting base64 string from frontend

    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Convert base64 to Blob/File (for demonstration, usually frontend sends form-data)
    const base64Data = file.replace(/^data:.+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Using Ayrshare API for storage (or you can use another service like S3)
    const AYRSHARE_API_KEY = "57EE17FA-3ADC4081-903F57CB-65F688CA";

    const formData = new FormData();
    formData.append("file", buffer, "upload.jpg"); // You can adjust file name dynamically

    const response = await fetch("https://app.ayrshare.com/api/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: result.message || "Upload failed" });
    }

    // Return uploaded file URL
    res.status(200).json({ fileUrl: result.url });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
