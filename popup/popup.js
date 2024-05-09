let loadingIcon = document.getElementById("loading-icon");
let screenshotButton = document.getElementById("screenshot-button");

// Triggers the capture of a screenshot
document.getElementById("screenshot-button").addEventListener("click", function () {
    chrome.runtime.sendMessage({action: "capture_screenshot"}, (response) => {
        console.log("sendImageToAnalyze response: ", response)
        if (response.success) {
            console.log("Entered screennshot-button success block")
            const base64_image = response.base64_image;
            console.log("Screenshot captured: ", base64_image);

            // get textarea value
            const site_context = document.getElementById("screenshot-context").value;

            screenshotButton.style.visibility = "hidden";
            loadingIcon.style.display = "block";

            sendImageToAnalyze(base64_image, site_context);
        } else {
            console.error("Screenshot capture failed: " + response.error);
        }
    });
});

// Sends the image to the server to be analyzed
function sendImageToAnalyze(base64_image, site_context) {
    chrome.runtime.sendMessage({
        action: "analyze_image",
        base64_image: base64_image,
        site_context: site_context
    }, (response) => {
        console.log("sendImageToAnalyze response: ", response)
        if (response.success) {
            console.log("Entered analyze_image success block")
            // TODO: Handle success response from the server
            // Open new tab with the result
            document.getElementById("test-cases-list").innerHTML = response.data;
            document.getElementsByTagName("html")[0].classList.add("expand");

            loadingIcon.style.display = "none";

            console.log("Response from server: ", response);

        } else {
            console.error("Screenshot capture failed: " + response.error);
            loadingIcon.style.display = "none";
        }


        return true;
    });
}


