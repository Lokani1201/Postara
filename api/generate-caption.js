// File: api/generate-caption.js
import fetch from 'node-fetch';
import formidable from 'formidable';

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
      // Send file to Ayrshare AI Caption endpoint
      const apiKey = process.env.AYRSHARE_API_KEY; // your API key in Vercel Environment
      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.filepath));

      const response = await fetch('https://app.ayrshare.com/api/social/caption', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        },
        body: formData
      });

      const data = await response.json();

      if (data && data.caption) {
        return res.status(200).json({ caption: data.caption });
      } else {
        return res.status(500).json({ error: 'AI could not generate caption' });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  });
}
