import formidable from "formidable";
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

const API_KEY = "57EE17FA-3ADC4081-903F57CB-65F688CA";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form parse error" });

    const file = files.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    try {
      const fileData = fs.readFileSync(file.filepath);

      const response = await fetch("https://app.ayrshare.com/api/post", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: fileData,
      });

      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
}
