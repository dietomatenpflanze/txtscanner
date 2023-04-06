// Variables
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const processedImage = document.getElementById('processed-image');
const rawResult = document.getElementById('raw-result');
const tableResult = document.getElementById('table-result');
const feedbackText = document.getElementById('feedback-text');
const startStopBtn = document.getElementById('start-stop-btn');
const loadingProgress = document.getElementById('loading-progress');
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
async function startTextDetection() {
    try {
        // Check camera access
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.play();

        feedbackText.textContent = 'Waiting for permission to access Tesseract library...';
        loadingProgress.style.display = 'block';

        // Load Tesseract library and initialize worker
        tesseractWorker = Tesseract.createWorker({
            logger: progress => {
                loadingProgress.value = progress.progress;
            }
        });
        await tesseractWorker.load();
        await tesseractWorker.initialize('eng');

        feedbackText.textContent = 'Text detection started...';
        isDetecting = true;
        startStopBtn.textContent = 'Stop';

        // Start text detection loop
        while (isDetecting) {
            const result = await tesseractWorker.recognize(video);
            updateResult(result);
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        feedbackText.textContent = 'Error accessing camera. Please check camera permissions.';
    }
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

        // Show feedback to user when text is detected
        if (result.text.length > 0) {
            feedbackText.textContent = 'Text detected!';
        } else {
            feedbackText.textContent = '';
        }
    }
}
