chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received: ", message);
    if (message.action === "capture_screenshot") {
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (base64_image) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError.message);
                console.error("Error capturing screenshot: ", chrome.runtime.lastError.message);
                sendResponse({ success: false, error: chrome.runtime.lastError.message });
            } else {
                console.log("Screenshot captured: ", base64_image);
                sendResponse({ success: true, base64_image: base64_image.toString() });
            }
        });

        return true; // Asynchronous response

    } else if (message.action === "analyze_image") {
        const { base64_image, site_context } = message;
        const url = "http://127.0.0.1:5000/api/v1/get_test_cases";

        console.log("sending image to server: ", base64_image);

        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "base64_image": base64_image, "site_context": site_context})

        }).then(response => response.json()).then(data => {
            console.log("Data: ", data);
            sendResponse({ success: true, data });
        }).catch(error => {
            console.error("Error: ", error);
            sendResponse({ success: false, error: error.message });
        });

        return true; // Asynchronous response
    }
});
