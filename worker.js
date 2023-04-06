// Worker script for text detection with Tesseract.js

// Import Tesseract.js
importScripts('https://cdn.jsdelivr.net/npm/tesseract.js@2.2.2/dist/tesseract.js');

// Listen for message from main thread
self.addEventListener('message', function (event) {
  // Perform text detection with Tesseract.js
  Tesseract.recognize(event.data.imageData, 'eng')
    .then(function (result) {
      // Send detected text back to main thread
      self.postMessage({ text: result.text });
    })
    .catch(function (error) {
      console.error('Tesseract.js error:', error);
    });
});
