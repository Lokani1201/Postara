// api/upload.js
import fetch from "node-fetch";
import formidable from "formidable";

export const config = {
  api: {
    bodyParser: false, // important for file uploads
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "File parse failed" });

    const { post, platforms } = fields;
    const mediaFile = files.media;

    if (!mediaFile) return res.status(400).json({ error: "No media uploaded" });

    try {
      const formData = new FormData();
      formData.append("media", mediaFile.filepath ? fs.createReadStream(mediaFile.filepath) : mediaFile);
      formData.append("post", post || "Check this out!");
      formData.append("platforms", platforms);

      const response = await fetch("https://api.ayrshare.com/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AYRSHARE_API_KEY}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.status === "error") throw new Error(result.message);

      res.status(200).json({ result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Upload failed." });
    }
  });
}
