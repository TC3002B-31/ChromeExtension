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
            document.getElementById("feedback-section").classList.remove("hidden");

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
    let site_context = document.getElementById("screenshot-context");

    let htmlContent = `
    <html>
    <head>
        <style>
            html {
                background: #161618;
            }

            body {
                // margin: 14px;
                display: flex;
                justify-content: center;
                font-family: Arial, sans-serif;
            }

            h1 {
                color: var(--primary-text-color);
                font-size: 1.8em;
                text-decoration: underline;
                margin: 0;
                padding: 20px 15px;
                text-align: center;
            }

            li {
                list-style-type: none;
            }

            .list-item {
                display: grid;
                grid-template-columns: 1em auto;
                gap: 0.8em;
                margin-left: 2em;
            }

            #content-container {
                color: #FFF;
                background-color: #242529;
                width: 50%;
                overflow: auto;
            }

            #content-container::-webkit-scrollbar {
                width: 10px;
            }

            #context-container {
                display        : flex;
                gap            : 10px;
                flex-direction : column;
                padding        : 10px;
                text-align: center; 
                justiy-content: center;
            }

            #context-container p {
                color: #838486;
            }
 
            #progress-container {
                position: fixed;
                top: 0;
                right: 20.5%;
                padding: 10px;
                transform: translateX(-55%);
                background: rgba(0, 0, 0, 0.25);
                backdrop-filter: blur(5px);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: #1D7FFF;
            }

            #progress-container aside {
                color: #838486;
                font-style: italic;
            }

            #progress-value {
                margin-top: 0;
                margin-bottom: 4px;
                font-size: 1.5rem;
                font-weight: bold;
            }

            #test-cases-list {
                padding-bottom: 15px;
                display: flex;
                flex-direction: column;
                gap: 0.5em;
                margin: 1em;
            }

            .relative {
                position: relative;
            }

            .list-item {
                display               : grid;
                grid-template-columns : 1em auto;
                gap                   : 0.8em;
                margin-left: 2em;
            }
            
            input[type='checkbox'] {
                -webkit-appearance : none;
                appearance         : none;
                background-color   : #242529;
                margin             : 0;
                font               : inherit;
                color              : #838486;
                width              : 1.15em;
                height             : 1.15em;
                border             : 0.1em solid currentColor;
                border-radius      : 0.15em;
                transform          : translateY(-0.075em);
                display            : grid;
                place-content      : center;
            }
            
            input[type='checkbox']::before {
                content          : '';
                width            : 0.65em;
                height           : 0.65em;
                clip-path        : polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%);
                transform        : scale(0);
                transform-origin : bottom left;
                transition       : 120ms transform ease-in-out;
                box-shadow       : inset 0.5em 0.5em #1D7FFF;
                /* Windows High Contrast Mode */
                background-color : CanvasText;
            }
            
            input[type='checkbox']:checked::before {
                color: #1D7FFF;
                border             : 0.1em solid currentColor;
                transform : scale(1);
            }
            
            input[type='checkbox']:focus {
                outline        : max(2px, 0.15em) solid currentColor;
                outline-offset : max(2px, 0.15em);
            }
        </style>
    </head>
    <body>
        <div id="content-container" class="relative">
            <h1>SiteProof</h1>
            <div id="context-container">
                <p>Context: ${site_context.value}</p>
            </div>
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


