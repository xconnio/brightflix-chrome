/*
* Copyright (C) 2018  Omer Akram
*
* This program is free software; you can redistribute it and/or
* modify it under the terms of the GNU General Public License
* as published by the Free Software Foundation; either version 2
* of the License, or (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program; if not, write to the Free Software
* Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/


const NETFLIX = "https://www.netflix.com";
// TODO: Make this configurable.
const BRIGHTNESS_RAISED = 75;

let currentTab = null;
let wasBrightnessRaised = false;
var brightnessLowered = null;


function set_brightness(brightness, wasRaiseRequest) {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            wasBrightnessRaised = wasRaiseRequest;
        }
    };
    request.open("POST", "http://127.0.0.1:5020/call", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({"procedure": "io.crossbar.set_brightness", "args": [brightness]}));
}

function raise() {
    const request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var jsonResponse = JSON.parse(request.responseText);
            brightnessLowered = jsonResponse['args'][0];
            set_brightness(BRIGHTNESS_RAISED, true);
        }
    };
    request.open("POST", "http://127.0.0.1:5020/call", true);
    request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    request.send(JSON.stringify({"procedure": "io.crossbar.get_brightness"}));
}


function lower() {
    if (brightnessLowered != null) {
        set_brightness(brightnessLowered, false);
    }
}


function startLoop() {
    if (currentTab != null) {
        chrome.windows.get(currentTab.windowId, {"windowTypes": ['normal']}, function(window) {
            if (window.state === "fullscreen") {
                if (!wasBrightnessRaised) {
                    raise();
                }
            } else if (wasBrightnessRaised) {
                lower();
            }
            setTimeout(startLoop, 600);
        });
    } else if (wasBrightnessRaised) {
        lower();
    }
}


chrome.tabs.onActivated.addListener(function(info) {
    chrome.tabs.get(info.tabId, function(tab) {
        if (tab.url.startsWith(NETFLIX)) {
            currentTab = tab;
            startLoop();
        } else {
            currentTab = null;
        }
    });
});
