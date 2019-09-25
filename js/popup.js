document.addEventListener('DOMContentLoaded', function () {
    let slider = document.querySelector('#slider');
    chrome.storage.local.get({"brightness": 70}, function (response) {
        slider.value = response.brightness;
    });
    slider.addEventListener('change', function (response) {
        chrome.storage.local.set({"brightness": response.target.value}, null);
    });
});
