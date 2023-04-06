// Check camera permission
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true })
    .then(function (stream) {
      // Check camera compatibility
      var video = document.createElement('video');
      video.srcObject = stream;
      video.onloadedmetadata = function () {
        video.play();
        // Load Tesseract.js
        Tesseract.initialize({ workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@2.2.2/dist/worker.js' })
          .then(function () {
            // Provide feedback
            showFeedback('Tesseract.js loaded successfully.');
            // Enable start/stop button
            var startStopBtn = document.getElementById('startStopBtn');
            startStopBtn.disabled = false;
            startStopBtn.addEventListener('click', toggleTextDetection);
          })
          .catch(function (err) {
            // Show error feedback
            showFeedback('Failed to load Tesseract.js: ' + err);
          });
      };
    })
    .catch(function (err) {
      // Show error feedback
      showFeedback('Failed to access camera: ' + err);
    });
} else {
  // Show error feedback
  showFeedback('Camera not supported in this browser.');
}

var isTextDetectionRunning = false;

// Function to start/stop text detection
function toggleTextDetection() {
  var startStopBtn = document.getElementById('startStopBtn');
  var resultElem = document.getElementById('result');

  if (!isTextDetectionRunning) {
    // Start text detection
    startStopBtn.textContent = 'Stop';
    isTextDetectionRunning = true;
    showFeedback('Text detection started.');
    startTextDetection(resultElem);
  } else {
    // Stop text detection
    startStopBtn.textContent = 'Start';
    isTextDetectionRunning = false;
    showFeedback('Text detection stopped.');
  }
}

// Function to start text detection
function startTextDetection(resultElem) {
  var cameraOutput = document.getElementById('cameraOutput');
  var feedbackElem = document.getElementById('feedback');

  // Capture camera frame and send to worker
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');
  var worker = new Worker('worker.js');

  function captureCameraFrame() {
    if (!isTextDetectionRunning) {
      return;
    }

    context.drawImage(cameraOutput, 0, 0, canvas.width, canvas.height);
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    worker.postMessage({ imageData: imageData });
    requestAnimationFrame(captureCameraFrame);
  }

  // Start capturing camera frame and processing with Tesseract.js
  captureCameraFrame();

  // Listen for worker message
  worker.addEventListener('message', function (event) {
    if (!isTextDetectionRunning) {
      return;
    }

    if (event.data && event.data.text) {
      // Update result element with detected text
      resultElem.textContent = 'Detected Text: ' + event.data.text;
    }
  });

  // Provide feedback
  showFeedback('Text detection running...');
}

// Function to show feedback
function showFeedback(message) {
  var feedbackElem = document.getElementById('feedback');
  feedbackElem.textContent = message;
}
