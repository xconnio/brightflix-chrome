const NETFLIX = "https://www.netflix.com";

// TODO: Make these configurable.
const BRIGHTNESS_RAISED = 50;
const BRIGHTNESS_LOWERED = 10;


function set_brightness(brightness) {
    var request = new XMLHttpRequest();
    request.open("POST", "http://127.0.0.1:5020/brightness", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({"brightness": brightness}));
}


function raise() {
    set_brightness(BRIGHTNESS_RAISED);
}


function lower() {
    set_brightness(BRIGHTNESS_LOWERED);
}


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete' && tab.url.startsWith(NETFLIX)) {
        raise();
    }
});


chrome.tabs.onActivated.addListener(function(info) {
    chrome.tabs.get(info.tabId, function(tab) {
        tab.url.startsWith(NETFLIX) ? raise(): lower()
    });
});
