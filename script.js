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
    checkCameraAccess()
        .then(() => {
            isDetecting = true;
            startStopBtn.textContent = 'Stop';
            feedbackText.textContent = 'Text detection started...';
            feedbackText.style.color = 'green';
            captureVideoFrame();
        })
        .catch((error) => {
            console.error(error);
            feedbackText.textContent = 'Failed to access camera. Please check camera permissions.';
            feedbackText.style.color = 'red';
        });
}

// Function to stop text detection
function stopTextDetection() {
    isDetecting = false;
    startStopBtn.textContent = 'Start';
    feedbackText.textContent = 'Text detection stopped.';
    feedbackText.style.color = 'black';
    if (tesseractWorker) {
        tesseractWorker.terminate();
        tesseractWorker = null;
    }
}

// Function to capture video frame and process for text detection
function captureVideoFrame() {
    if (!isDetecting) {
        return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = Tesseract.recognize(imageData, {
        lang: 'eng',
        tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz.,!?@#$%&*()-+=/:;"\''
    });

    processedImage.src = canvas.toDataURL();
    rawResult.textContent = result.text;
    tableResult.innerHTML = getTableHTML(result.words);

    requestAnimationFrame(captureVideoFrame);
}

// Function to get HTML for table-like result
function getTableHTML(words) {
    let tableHTML = '<tr><th>Text</th><th>Confidence</th></tr>';
    words.forEach(word => {
        if (word.confidence > 60) {
            tableHTML += `<tr><td>${word.text}</td><td>${word.confidence}</td></tr>`;
        }
    });
    return tableHTML;
}

// Function to check camera access
function checkCameraAccess() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                video.srcObject = stream;
                video.onloadedmetadata = () => {
                    video.play();
                    resolve();
                };
            })
            .catch((error) => {
                reject(error);
            });
    });
}
