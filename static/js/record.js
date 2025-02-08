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
    const recordButton = document.getElementById("recordButton");
    const audioPreview = document.getElementById("audioPreview");
    const fileNameDisplay = document.getElementById("fileName");

    let mediaRecorder;
    let audioChunks = [];

    // Handle the file input change (for uploaded files)
    fileInput.addEventListener("change", function () {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileURL = URL.createObjectURL(file);
            audioPreview.src = fileURL;
            audioPreview.style.display = "block"; // Show audio player
            fileNameDisplay.textContent = file.name; // Show uploaded file name
        } else {
            fileNameDisplay.textContent = "No file selected"; // Placeholder text
        }
    });

    // Handle the record button logic (for recording)
    if (recordButton) {
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
                        // Store Base64 data to be sent to the server
                        document.getElementById("recordedAudioInput").value = reader.result;
                    };

                    // Show audio preview
                    const audioURL = URL.createObjectURL(audioBlob);
                    audioPreview.src = audioURL;
                    audioPreview.style.display = "block";
                    
                    // Generate timestamped file name
                    const date = new Date();
                    const timestamp = `${date.getHours().toString().padStart(2, '0')}_${date.getMinutes().toString().padStart(2, '0')}`; // Hour and Minute
                    const fileName = `Recording_${timestamp}.wav`;
                    fileNameDisplay.textContent = fileName; // Display the simplified file name
                };

                mediaRecorder.start();
                recordButton.innerText = "⏹ Stop Recording";
            } else {
                mediaRecorder.stop();
                recordButton.innerText = "🎤 Record Audio";
            }
        });
    }
});
