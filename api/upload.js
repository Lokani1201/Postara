import formidable from "formidable-serverless";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

const AYRSHARE_API_KEY = process.env.AYRSHARE_API_KEY; // API key from Vercel environment

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

      // Read file and convert to base64
      const fileData = fs.readFileSync(file.filepath);
      const base64File = fileData.toString("base64");

      // Call Ayrshare API to upload media
      const response = await fetch("https://app.ayrshare.com/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AYRSHARE_API_KEY}`,
        },
        body: JSON.stringify({
          text: fields.caption || "",
          media: [base64File],
          platforms: fields.platforms ? JSON.parse(fields.platforms) : []
        }),
      });

      const data = await response.json();

      if (data.id) {
        return res.status(200).json({ success: true, postId: data.id });
      } else {
        return res.status(500).json({ error: "Upload failed", details: data });
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
