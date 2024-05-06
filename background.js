chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "capture_screenshot") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (image) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                sendResponse({ success: true, screenshot: image });
            }
        });
        return true; // Indicates that the response will be sent asynchronously
    } else if (message.action === "analyze_image") { // Image is sent to the server for analysis
        /*const url = "http://localhost:5000/analyze";
        fetch(url, {
            method: "POST",
            body: JSON.stringify({ image: message.image }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => response.json()).then(data => {
            sendResponse({ success: true, data });
        }).catch(error => {
            console.error("Error: ", error);
            sendResponse({ success: false, error });
        });*/
        // TODO: Send image to the server and retrieve the response
        console.log("Image sending: ", message.image);
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
            sendResponse({ success: true });
        }
        return true; // Indicates that the response will be sent asynchronously
    }
});
