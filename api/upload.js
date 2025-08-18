import fetch from "node-fetch";
import formidable from "formidable-serverless";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Only POST allowed" });

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ message: err.message });

    const file = files.file;
    const caption = fields.caption || "";

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    try {
      // Upload to Ayrshare
      const formData = new FormData();
      formData.append("media", file.filepath ? fs.createReadStream(file.filepath) : file);
      formData.append("caption", caption);

      const response = await fetch("https://app.ayrshare.com/api/post", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.AYRSHARE_API_KEY}`,
        },
        body: formData,
      });

      const data = await response.json();
      res.status(200).json({ success: true, data });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: false, message: e.message });
    }
  });
}
