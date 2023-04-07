// Wait for DOM to load
document.addEventListener("DOMContentLoaded", function () {
    // Get elements
    var startButton = document.getElementById("startButton");
    var stopButton = document.getElementById("stopButton");
    var resultElement = document.getElementById("result");
    var feedbackElement = document.getElementById("feedback");
    var cameraInput = document.getElementById("cameraInput");
    var canvasOutput = document.getElementById("canvasOutput");
    var ctx = canvasOutput.getContext("2d");

    var isCameraStarted = false;
    var isTesseractLoaded = false;

    // Check for camera compatibility and permissions
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(function (stream) {
                cameraInput.srcObject = stream;
                cameraInput.play();
                startButton.disabled = false;
            })
            .catch(function (error) {
                feedbackElement.textContent =
                    "Camera access denied. Please enable camera permissions.";
            });
    } else {
        feedbackElement.textContent = "Camera not supported on this browser.";
    }

    // Load Tesseract.js library
    Tesseract.initialize({
        lang: "eng",
        workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@2.1.4/dist/worker.min.js",
        corePath: "https://cdn.jsdelivr.net/npm/tesseract.js@2.1.4/dist/tesseract-core.wasm.js",
    })
    .then(function () {
        isTesseractLoaded = true;
        feedbackElement.textContent = "Tesseract.js loaded successfully.";
    })
    .catch(function (error) {
        feedbackElement.textContent = "Failed to load Tesseract.js.";
    });

    // Start button click event
    startButton.addEventListener("click", function () {
        if (isCameraStarted && isTesseractLoaded) {
            feedbackElement.textContent = "Detecting text...";
            startButton.disabled = true;
            stopButton.disabled = false;
            detectTextFromCamera();
        } else {
            if (!isCameraStarted) {
                feedbackElement.textContent = "Camera not started yet.";
            }
            if (!isTesseractLoaded) {
                feedbackElement.textContent = "Tesseract.js not loaded yet.";
            }
        }
    });

    // Stop button click event
    stopButton.addEventListener("click", function () {
        stopButton.disabled = true;
        startButton.disabled = false;
        feedbackElement.textContent = "Text detection stopped.";
    });

    // Function to detect text from camera
    function detectTextFromCamera() {
        ctx.drawImage(cameraInput, 0, 0, canvasOutput.width, canvasOutput.height);
        var imageData = ctx.getImageData(0, 0, canvasOutput.width, canvasOutput.height);
        Tesseract.recognize(imageData)
        .then(function (result) {
            resultElement.textContent = result.text;
            detectTextFromCamera();
        })
        .catch(function (error) {
            feedbackElement.textContent = "Failed to detect text. Please try again.";
            stopButton.disabled = true;
            startButton.disabled = false;
        });
    }
});
