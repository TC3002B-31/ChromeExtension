// Sends the image to the server to be analyzed
function sendImageToAnalyze(screenshot){
    chrome.runtime.sendMessage({ action: "analyze_image", image: screenshot }, (response) => {
        if (response.success) {
            // TODO: Handle success response from the server
            console.log("Image was sent ");
        } else {
            console.error("Screenshot capture failed: " + response.error);
        }
    });
}

// Triggers the capture of a screenshot
document.getElementById("screenshot-button").addEventListener("click", function () {
    chrome.runtime.sendMessage({ action: "capture_screenshot" }, (response) => {
        if (response.success) {
            const link = document.createElement("a");
            const screenshot = response.screenshot;
            link.href = screenshot;
            link.download = "screenshot.png";
            sendImageToAnalyze(screenshot);
            //link.click();
        } else {
            console.error("Screenshot capture failed: " + response.error);
        }
    });
});
