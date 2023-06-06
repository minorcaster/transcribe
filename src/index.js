const transcribe = (file, language, response_format) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('response_format', response_format || 'verbose_json');
    if (language) {
      formData.append('language', language);
    }
  
    // Make a request to the serverless function instead of directly to the OpenAI API
    return fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    }).then(response => {
      console.log(response);
      if (response_format === 'json' || response_format === 'verbose_json') {
        return response.json();
      } else {
        return response.text();
      }
    }).catch(error => console.error(error));
  };
  
  const hideStartView = () => {
    document.querySelector('#start-view').classList.add('hidden');
  };
  
  const showStartView = () => {
    document.querySelector('#start-view').classList.remove('hidden');
  };
  
  const updateTextareaSize = (element) => {
    element.style.height = 0;
    const style = window.getComputedStyle(element);
    const paddingTop = parseFloat(style.getPropertyValue('padding-top'));
    const paddingBottom = parseFloat(style.getPropertyValue('padding-bottom'));
    const height = element.scrollHeight - paddingTop - paddingBottom;
    element.style.height = `${height}px`;
  };
  
  let outputElement;
  const setTranscribingMessage = (text) => {
    outputElement.innerHTML = text;
  };
  
  const setTranscribedPlainText = (text) => {
    text = text.replaceAll('&', '&amp;');
    text = text.replaceAll('<', '&lt;');
    text = text.replaceAll('>', '&gt;');
    outputElement.innerHTML = `<pre>${text}</pre>`;
  };
  
  const setTranscribedSegments = (segments) => {
    outputElement.innerHTML = '';
    for (const segment of segments) {
      const element = document.createElement('div');
      element.classList.add('segment');
      element.innerText = segment.text;
      outputElement.appendChild(element);
    }
  };
  
  window.addEventListener('load', () => {
    hideStartView();
    outputElement = document.querySelector('#output');
    const fileInput = document.querySelector('#audio-file');
    fileInput.addEventListener('change', () => {
      setTranscribingMessage('Transcribing...');
      const file = fileInput.files[0];
      const language = document.querySelector('#language').value;
      const response_format = document.querySelector('#response_format').value;
      const response = transcribe(file, language, response_format);
      response.then(transcription => {
        if (response_format === 'verbose_json') {
          setTranscribedSegments(transcription.segments);
        } else {
          setTranscribedPlainText(transcription);
        }
        // Allow multiple uploads without refreshing the page
        fileInput.value = null;
      });
    });
  });
  