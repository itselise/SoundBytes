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
