// api/upload.js
import fetch from "node-fetch";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // disable default body parser
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Form parsing error" });
    }

    if (!files.file) {
      return res.status(400).json({ error: "File is required" });
    }

    try {
      const file = files.file;
      const fileData = fs.readFileSync(file.filepath);

      // Replace with your API key
      const API_KEY = "57EE17FA-3ADC4081-903F57CB-65F688CA";

      const response = await fetch("https://app.ayrshare.com/api/social/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: fileData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return res.status(500).json({ error: errorData.message || "Upload failed" });
      }

      const data = await response.json();
      return res.status(200).json({ url: data.url || "" });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}
