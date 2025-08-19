import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = "./public/uploads"; // folder to save files
  form.keepExtensions = true;

  // Make sure uploads folder exists
  if (!fs.existsSync(form.uploadDir)) fs.mkdirSync(form.uploadDir, { recursive: true });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "File upload failed" });
    }

    const file = files.file;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const newPath = path.join(form.uploadDir, file.originalFilename);
    fs.renameSync(file.filepath, newPath);

    const url = `/uploads/${file.originalFilename}`;
    res.status(200).json({ url });
  });
}
