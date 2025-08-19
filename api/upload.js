import fetch from 'node-fetch';
import FormData from 'form-data';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const file = req.body.file; // Expecting base64 or file buffer
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const form = new FormData();
    form.append('file', file, 'upload.jpg'); // You can change the filename or handle videos
