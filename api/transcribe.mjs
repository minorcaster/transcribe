import fetch from 'node-fetch';
import FormData from 'form-data';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

export default (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'Error processing file upload.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const file = req.file;
    const language = req.body.language;
    const response_format = req.body.response_format || 'verbose_json';

    const formData = new FormData();
    formData.append('file', file.buffer, { filename: file.originalname });
    formData.append('model', 'whisper-1');
    formData.append('response_format', response_format);
    if (language) {
      formData.append('language', language);
    }

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    let result;
    if (response_format === 'json' || response_format === 'verbose_json') {
      result = await response.json();
    } else {
      result = await response.text();
    }

    res.json({ result });
  });
};