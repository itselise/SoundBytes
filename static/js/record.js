let mediaRecorder;
let audioChunks = [];

document.addEventListener("DOMContentLoaded", function () {
    const recordButton = document.getElementById("recordButton");
    const audioInput = document.getElementById("recordedAudioInput");
    const audioPreview = document.getElementById("audioPreview");
    const statusText = document.getElementById("status");

    if (recordButton) {
        recordButton.addEventListener("click", async function () {
            if (!mediaRecorder || mediaRecorder.state === "inactive") {
                // Start recording
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                    audioChunks = [];
                
                    // Convert to Base64 and store in hidden input
                    const reader = new FileReader();
                    reader.readAsDataURL(audioBlob);
                    reader.onloadend = function () {
                        audioInput.value = reader.result;
                    };
                
                    // Show audio preview
                    const audioURL = URL.createObjectURL(audioBlob);
                    audioPreview.src = audioURL;
                    audioPreview.style.display = "block";
                    statusText.innerText = "Recording saved!";
                
                    // ✅ Display the recorded file name dynamically
                    const fileNameDisplay = document.getElementById("fileName");
                    fileNameDisplay.textContent = "Recorded_Audio.wav"; // Custom file name
                };
                
                mediaRecorder.start();
                recordButton.innerText = "⏹ Stop Recording";
                statusText.innerText = "Recording...";
            } else {
                // Stop recording
                mediaRecorder.stop();
                recordButton.innerText = "🎤 Record Audio";
                statusText.innerText = "Processing...";
            }
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("audio");
    const fileNameDisplay = document.getElementById("fileName");
    const audioPreview = document.getElementById("audioPreview");

    // Handle file upload
    fileInput.addEventListener("change", function () {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name; // Show actual file name
            const fileURL = URL.createObjectURL(fileInput.files[0]);
            audioPreview.src = fileURL;
            audioPreview.style.display = "block";  // Show the audio player
        } else {
            fileNameDisplay.textContent = "No file selected"; // Placeholder text
        }
    });

    // Handle audio recording
    const recordButton = document.getElementById("recordButton");
    let mediaRecorder;
    let audioChunks = [];
    
    recordButton.addEventListener("click", async function () {
        if (!mediaRecorder || mediaRecorder.state === "inactive") {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
                audioChunks = [];

                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = function () {
                    // Assign Base64 data to a hidden field or process further
                    document.getElementById("recordedAudioInput").value = reader.result;
                };

                const audioURL = URL.createObjectURL(audioBlob);
                audioPreview.src = audioURL;
                audioPreview.style.display = "block"; // Show audio player
                fileNameDisplay.textContent = "Recorded_Audio.wav"; // Display file name
            };

            mediaRecorder.start();
            recordButton.innerText = "⏹ Stop Recording";
        } else {
            mediaRecorder.stop();
            recordButton.innerText = "🎤 Record Audio";
        }
    });
});
