import fetch from 'node-fetch';
import FormData from 'form-data';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

// This is a new function that you need to implement
function convertJsonToFormat(jsonResult, format) {
  return JSON.stringify(jsonResult);
}

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
    } else if (response_format === 'srt' || response_format === 'vtt') {
      // Convert the JSON response to the desired format
      const jsonResult = await response.json();
      result = convertJsonToFormat(jsonResult, response_format);
    } else {
      result = await response.text();
    }
    res.json({ result });
  });
};
