import formidable from "formidable";
import fs from "fs";
import path from "path";

// Disable body parsing (for file uploads)
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), "/public/uploads"); // make sure /public/uploads exists
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "File upload failed" });
    }

    const file = files.file;
    const filePath = `/uploads/${path.basename(file.filepath)}`;
    res.status(200).json({ url: filePath });
  });
}
