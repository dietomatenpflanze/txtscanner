// Variables
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const processedImage = document.getElementById('processed-image');
const rawResult = document.getElementById('raw-result');
const tableResult = document.getElementById('table-result');
const feedbackText = document.getElementById('feedback-text');
const startStopBtn = document.getElementById('start-stop-btn');
let isDetecting = false;
let tesseractWorker = null;

// Event listener for start/stop button
startStopBtn.addEventListener('click', () => {
    if (isDetecting) {
        stopTextDetection();
    } else {
        startTextDetection();
    }
});

// Function to start text detection
function startTextDetection() {
    // Check camera access
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            video.play();
            feedbackText.textContent = 'Text detection started...';
            isDetecting = true;
            startStopBtn.textContent = 'Stop';
            tesseractWorker = Tesseract.createWorker();
            tesseractWorker.load();
            tesseractWorker.recognize(video)
                .then(result => {
                    updateResult(result);
                })
                .finally(() => {
                    stopTextDetection();
                });
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
            feedbackText.textContent = 'Error accessing camera. Please check camera permissions.';
        });
}

// Function to stop text detection
function stopTextDetection() {
    if (isDetecting) {
        video.srcObject.getTracks()[0].stop();
        video.srcObject = null;
        feedbackText.textContent = '';
        isDetecting = false;
        startStopBtn.textContent = 'Start';
        if (tesseractWorker) {
            tesseractWorker.terminate();
            tesseractWorker = null;
        }
    }
}

// Function to update result
function updateResult(result) {
    if (result) {
        // Update processed image
        processedImage.src = result.dataUrl;

        // Update raw result
        rawResult.textContent = result.text;

        // Update table-like result
        const lines = result.text.split('\n');
        let tableHTML = '';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.length > 0) {
                tableHTML += `<tr><td>${line}</td></tr>`;
            }
        }
        tableResult.innerHTML = tableHTML;
    }
}
