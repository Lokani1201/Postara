import fetch from "node-fetch";
import formidable from "formidable-serverless";

export const config = {
  api: {
    bodyParser: false,
  },
};

const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY; // your API key from Vercel environment

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error parsing file" });
      }

      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Convert file to base64 for API
      const fs = require("fs");
      const fileData = fs.readFileSync(file.filepath);
      const base64File = fileData.toString("base64");

      // Call Ayrshare AI caption API
      const response = await fetch("https://app.ayrshare.com/api/caption", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
        },
        body: JSON.stringify({
          file: base64File,
          count: 5
        }),
      });

      const data = await response.json();
      if (data.captions) {
        return res.status(200).json({ captions: data.captions });
      } else {
        return res.status(500).json({ error: "No captions returned from API" });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
