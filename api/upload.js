// File: api/upload.js
import formidable from 'formidable';
import fs from 'fs';
import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: false
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Error parsing file' });
    }

    const file = files.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      const apiKey = process.env.AYRSHARE_API_KEY; // API key in Vercel Environment
      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.filepath));
      formData.append('caption', fields.caption || '');
      formData.append('platforms', fields.platforms || ''); // comma-separated

      const response = await fetch('https://app.ayrshare.com/api/social/post', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });

      const data = await response.json();

      if (data && data.success) {
        return res.status(200).json({ success: true, message: 'Post uploaded successfully', data });
      } else {
        return res.status(500).json({ error: 'Failed to upload post', details: data });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  });
}
