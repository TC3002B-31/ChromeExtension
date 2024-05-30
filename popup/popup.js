let loadingIcon = document.getElementById("loading-icon");
let screenshotButton = document.getElementById("screenshot-button");

// Triggers the capture of a screenshot
document.getElementById("screenshot-button").addEventListener("click", function () {
    // get textarea value
    const site_context = document.getElementById("screenshot-context");
    site_context.disabled = true;

    screenshotButton.style.visibility = "hidden";
    loadingIcon.classList.remove("hide");

    chrome.runtime.sendMessage({ action: "capture_screenshot" }, (response) => {
        console.log("sendImageToAnalyze response: ", response)
        if (response.success) {
            const base64_image = response.base64_image;
            console.log("Screenshot captured: ", base64_image);


            sendImageToAnalyze(base64_image, site_context.value);


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
            let testCasesList = document.getElementById("test-cases-list");
            testCasesList.innerHTML = response.data;
            testCasesList.classList.remove("hide");

            document.getElementsByTagName("html")[0].classList.add("expand");

            loadingIcon.style.display = "none";

            getAllTasks();

            console.log("Response from server: ", response);
        } else {
            console.error("Screenshot capture failed: " + response.error);
            loadingIcon.style.display = "none";
        }


        return true;
    });
}

let tasksCheckboxes = []
let taskProgress = 0;

function updateProgress() {
    document.getElementById("progress-container").classList.remove("hide");
    document.getElementById("download-button").classList.remove("hide");

    let progressValue = document.getElementById("progress-value");
    let progressPercentage = (taskProgress / tasksCheckboxes.length) * 100;
    progressValue.innerHTML = Math.round(progressPercentage) + "%";

}

function getAllTasks() {
    tasksCheckboxes = document.querySelectorAll("input[type='checkbox']");
    console.log("tasksCheckboxes: ", tasksCheckboxes);
    updateProgress();

    for (let i = 0; i < tasksCheckboxes.length; i++) {
        tasksCheckboxes[i].addEventListener("change", function () {
            if (tasksCheckboxes[i].checked) {
                taskProgress++;
            } else {
                taskProgress--;
            }
            updateProgress();
        });
    }

}

// Add event listener for the download button
document.getElementById('download-button').addEventListener('click', function () {
    // Generate the HTML content
    let testCasesListContent = document.getElementById('test-cases-list').innerHTML;
    let progressContainerContent = document.getElementById('progress-container').innerHTML;

    let htmlContent = `
    <html>
    <head>
        <style>
        </style>
    </head>
    <body>
        <div class="relative">
            <div id="progress-container">
                ${progressContainerContent}
            </div>
            <div id="test-cases-list">
                ${testCasesListContent}
            </div>
        </div>
    </body>
    <script>
                let tasksCheckboxes = []
                let taskProgress = 0;
                
                function updateProgress() {
                    let progressContainer = document.getElementById("progress-container");
                    let progressValue = document.getElementById("progress-value");
        
                    if (progressContainer) {
                        progressContainer.classList.remove("hide");
                    }
                    if (progressValue) {
                        let progressPercentage = (taskProgress / tasksCheckboxes.length) * 100;
                        progressValue.innerHTML = Math.round(progressPercentage) + "%";
                    }
                }
                
                function getAllTasks() {
                    tasksCheckboxes = document.querySelectorAll("input[type='checkbox']");
                    console.log("tasksCheckboxes: ", tasksCheckboxes);
                    updateProgress();
                
                    for (let i = 0; i < tasksCheckboxes.length; i++) {
                        tasksCheckboxes[i].addEventListener("change", function () {
                            if (tasksCheckboxes[i].checked) {
                                taskProgress++;
                            } else {
                                taskProgress--;
                            }
                            updateProgress();
                        });
                    }
                
                }
                document.addEventListener('DOMContentLoaded', (event) => {
                    getAllTasks();
                });
            </script>
    </html>
    `;

    // Create a Blob with the HTML content
    let blob = new Blob([htmlContent], { type: 'text/html' });
    let url = URL.createObjectURL(blob);

    // Create a temporary link element and trigger the download
    let a = document.createElement('a');
    a.href = url;
    a.download = 'test-cases.html';
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

let feedbackVal = "";
let thumbUp = document.getElementById("thumb-up_icon");
let thumbUpFill = document.getElementById("thumb-up-fill_icon");
let thumbDown = document.getElementById("thumb-down_icon");
let thumbDownFill = document.getElementById("thumb-down-fill_icon");

function updateFeedbackIcons(){
    if(feedbackVal === "positive"){
        thumbUp.classList.add("hide");
        thumbUpFill.classList.remove("hide");
        thumbDown.classList.remove("hide");
        thumbDownFill.classList.add("hide");
    } else if(feedbackVal === "negative"){
        thumbUp.classList.remove("hide");
        thumbUpFill.classList.add("hide");
        thumbDown.classList.add("hide");
        thumbDownFill.classList.remove("hide");
    } else {
        thumbUp.classList.remove("hide");
        thumbUpFill.classList.add("hide");
        thumbDown.classList.remove("hide");
        thumbDownFill.classList.add("hide");

    }
}

updateFeedbackIcons();

thumbUp.addEventListener("click", function () {
    feedbackVal = "positive";
    updateFeedbackIcons();
});

thumbDown.addEventListener("click", function () {
    feedbackVal = "negative";
    updateFeedbackIcons();
    // Open a user input dialog to get feedback
    let feedback = prompt("Please provide feedback. How can we improve our model?", "");
});


