function set_brightness(brightness) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://127.0.0.1:5020/brightness", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    data = {"brightness": brightness}
    xhr.send(JSON.stringify(data));
}


chrome.tabs.onActivated.addListener(function(info) {
    chrome.tabs.get(info.tabId, function(tab) {
        if (tab.url.startsWith("https://www.netflix.com")) {
            set_brightness(50);
        } else {
            set_brightness(10);
        }
    });
});

