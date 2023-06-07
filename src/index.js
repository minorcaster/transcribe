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
  }).then(response => response.json())
    .then(data => {
      if (data.error) {
        console.error(data.error);
        return;
      }
      return data.result;
    })
    .catch(error => console.error(error));
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
let downloadButton;

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
  outputElement = document.querySelector('#output');
  downloadButton = document.querySelector('#download-btn');
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
  
      // Enable the download button and add a click event listener
      downloadButton.disabled = false;
      
      // Show the download button
      downloadButton.style.display = 'inline-block';
  
      downloadButton.addEventListener('click', function() {
      // Get the displayed text from the outputElement
      const displayedText = outputElement.innerText;

      // Create a Blob from the displayed text
      let blob = new Blob([displayedText], {type: "text/plain;charset=utf-8"});
      
      // Create a URL for the Blob
      let url = URL.createObjectURL(blob);

      // Create a temporary anchor element and click it to start the download
      let tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.download = 'transcription.txt';
      tempLink.click();
    });

    // Allow multiple uploads without refreshing the page
    fileInput.value = null;
    });
  });
});