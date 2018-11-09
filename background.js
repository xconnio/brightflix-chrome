/*
Copyright (C) 2018  Omer Akram

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/


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
