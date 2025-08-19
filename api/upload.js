import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = new formidable.IncomingForm();
  form.uploadDir = path.join(process.cwd(), "/public/uploads");
  form.keepExtensions = true;

  // Ensure the uploads folder exists
  if (!fs.existsSync(form.uploadDir)) {
    fs.mkdirSync(form.uploadDir, { recursive: true });
  }

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "File upload failed" });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = file.filepath || file.path; // for formidable v2 or v1
    const fileName = path.basename(filePath);

    // Return public URL
    const publicUrl = `/uploads/${fileName}`;
    return res.status(200).json({ url: publicUrl });
  });
}
