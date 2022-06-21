var functionDocumentEventKeyupiListner;
var functionDocumentEventClickListner;
try {
    var logs_status = window.localStorage.getItem('UAT_USER_ACTIVITY_LOG_STATUS');
    if (logs_status) {
        if (logs_status === 'RUNNING') {
            startActivityTracker(false);
        }
    }
} catch (error) {

}

export function startActivityTracker(reset = false) {
    document.removeEventListener("keyup", functionDocumentEventKeyupiListner);
    document.removeEventListener("click", functionDocumentEventClickListner);
    let user_activity;
    if (reset) {
        window.localStorage.removeItem("UAT_USER_ACTIVITY_LOG");
        window.localStorage.setItem("UAT_USER_ACTIVITY_LOG_STATUS", "RUNNING");
        user_activity = [];
    } else {
        try {
            var previous_logs = window.localStorage.getItem('UAT_USER_ACTIVITY_LOG');
            if (previous_logs) {
                user_activity = JSON.parse(previous_logs);
            } else {
                user_activity = [];
            }
        } catch (error) {
            user_activity = [];
        }

    }

    const ACTIVITY_TEXT_SELECTION = "ACTIVITY_TEXT_SELECTION";
    const ACTIVITY_TEXT_INPUT = "ACTIVITY_TEXT_INPUT";
    const ACTIVITY_CLICK = "ACTIVITY_CLICK";

    const ELEMENT_TYPE_ID = "ELEMENT_TYPE_ID";
    const ELEMENT_TYPE_CLASS = "ELEMENT_TYPE_CLASS";
    const ELEMENT_TYPE_OBJECT = "ELEMENT_TYPE_OBJECT";

    var totalSeconds = 0;
    let intervalSeconds = null;

    function setTime() {
        ++totalSeconds;
    }

    function addUserActivity(
        activity_type,
        element_type,
        element_config,
        url,
        wait_delay = totalSeconds,
        value = "UAT_NULL",
        metadata = "UAT_NULL"
    ) {
        var logs_status = window.localStorage.getItem('UAT_USER_ACTIVITY_LOG_STATUS');
        let actual_log_status = 'NA'
        if (logs_status) {
            actual_log_status = logs_status;
        } else {
            actual_log_status = 'STOPPED';
        }

        if (actual_log_status === 'RUNNING') {
            let d = {
                activity_type: activity_type,
                element_type: element_type,
                element_config: element_config,
                url: url,
                value: value,
                metadata: metadata,
                wait_delay: wait_delay,
            };

            user_activity.push(d);
            window.localStorage.setItem(
                "UAT_USER_ACTIVITY_LOG",
                JSON.stringify(user_activity)
            );
        }
    }
    functionDocumentEventClickListner = function (event) {
        let selectedText = window.getSelection().toString().trim();
        let url = window.location.href;
        checkIfInputIsPending(url);
        let element_tag_name = event.target.tagName;
        let clicked_element = event.target;
        let target_element_id = event.target.id;
        if (event.target.id) {
            if (
                selectedText !== undefined &&
                selectedText !== null &&
                selectedText !== ""
            ) {
                addUserActivity(
                    ACTIVITY_TEXT_SELECTION,
                    ELEMENT_TYPE_ID,
                    window.getSelection().getRangeAt(0).startContainer.parentNode.id,
                    url,
                    0,
                    selectedText,
                    'UAT_NULL'
                );
            }
            addUserActivity(ACTIVITY_CLICK, ELEMENT_TYPE_ID, target_element_id, url, 0, 'UAT_NULL', 'UAT_NULL');
        } else {
            try {
                let pNodeId = null;
                let ele = event.target;
                let local_metadata = {};
                while (!ele.parentNode.id || !ele.parentNode.class) {
                    ele = ele.parentNode;
                }
                pNodeId = ele.parentNode.id;
                let all_elements_with_same_tags = document
                    .getElementById(pNodeId)
                    .getElementsByTagName(element_tag_name);
                let clicked_element_from_parent_id = null;
                let index_of_element = -1;
                for (var i = 0; i < all_elements_with_same_tags.length; i++) {
                    if (clicked_element === all_elements_with_same_tags[i]) {
                        clicked_element_from_parent_id = all_elements_with_same_tags[i];
                        index_of_element = i;
                        break;
                    }
                }

                local_metadata["pNodeId"] = pNodeId;
                local_metadata["element_tag_name"] = element_tag_name;
                local_metadata["index_of_element"] = index_of_element;
                local_metadata["clicked_element_from_parent_id"] = clicked_element_from_parent_id.href;
                if (
                    selectedText !== undefined &&
                    selectedText !== null &&
                    selectedText.trim() !== ""
                ) {
                    if (
                        window.getSelection().getRangeAt(0).startContainer.parentNode.id ===
                        ""
                    ) {
                        addUserActivity(
                            ACTIVITY_TEXT_SELECTION,
                            ELEMENT_TYPE_OBJECT,
                            pNodeId,
                            url,
                            totalSeconds,
                            selectedText,
                            local_metadata
                        );
                    } else {
                        addUserActivity(ACTIVITY_TEXT_SELECTION, ELEMENT_TYPE_ID, window.getSelection().getRangeAt(0).startContainer.parentNode.id, url,totalSeconds, selectedText, 'UAT_NULL');
                    }
                }
                addUserActivity(
                    ACTIVITY_CLICK,
                    ELEMENT_TYPE_OBJECT,
                    pNodeId,
                    url,
                    totalSeconds,
                    "UAT_NULL",
                    local_metadata
                );
            } catch (error) {

            }
        }

        resetTimer();
    }
    document.addEventListener("click", functionDocumentEventClickListner);


    function resetTimer(value = 0) {
        if (intervalSeconds) {
            clearInterval(intervalSeconds);
        }
        totalSeconds = value;
        intervalSeconds = setInterval(setTime, 1000);
    }

    let elementsWithFocusOutAttached = [];

    functionDocumentEventKeyupiListner = function (event) {
        if (!elementsWithFocusOutAttached.includes(event.target)) {
            elementsWithFocusOutAttached.push(event.target);
        }
    }
    document.addEventListener("keyup", functionDocumentEventKeyupiListner);

    function checkIfInputIsPending(url) {
        if (elementsWithFocusOutAttached.length > 0) {
            elementsWithFocusOutAttached.forEach((element) => {
                const index = elementsWithFocusOutAttached.indexOf(element);
                let local_metadata = {
                    element_tag_name: element.tagName,
                };
                if (index > -1) {
                    elementsWithFocusOutAttached.splice(index, 1); // 2nd parameter means remove one item only
                }
                try {
                    addUserActivity(ACTIVITY_TEXT_INPUT, ELEMENT_TYPE_ID, element.id, url, totalSeconds, element.getAttribute("value") || document.getElementById(element.id).value, local_metadata);
                } catch (error) {
                    console.error('Exception in finding id')
                }
                
            });
            resetTimer((value = 1));
        }
    }
}


export function stopActivityTracker() {
    document.removeEventListener("keyup", functionDocumentEventKeyupiListner);
    document.removeEventListener("click", functionDocumentEventClickListner);
    window.localStorage.setItem("UAT_USER_ACTIVITY_LOG_STATUS", "STOPPED");
}

export function resetData() {
    try {
        window.localStorage.setItem('UAT_USER_ACTIVITY_LOG', JSON.stringify([]));
    } catch (error) {
        console.error('Error in reseting basic activity');
    }

}