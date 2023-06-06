const fetch = require('node-fetch');
const FormData = require('form-data');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

module.exports = (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: 'Error processing file upload.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    const file = req.file;  // The uploaded file
    const language = req.body.language;
    const response_format = req.body.response_format || 'verbose_json';

    // Prepare the form data
    const formData = new FormData();
    formData.append('file', file.buffer, { filename: file.originalname });
    formData.append('model', 'whisper-1');
    formData.append('response_format', response_format);
    if (language) {
      formData.append('language', language);
    }

    // Make the request to the OpenAI API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    // Handle the response format
    let result;
    if (response_format === 'json' || response_format === 'verbose_json') {
      result = await response.json();
    } else {
      result = await response.text();
    }

    // Return the result
    res.json({ result });
  });
};
