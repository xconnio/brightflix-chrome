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

var currentTab = null;
var wasBrightnessRaised = false;
var brightnessLowered = null;
var WAMPSession = null;

function connect_crossbar() {
    var connection = new autobahn.Connection({
        url: "ws://127.0.0.1:5020/ws",
        realm: "realm1"
    });

    connection.onopen = function (session, details) {
        WAMPSession = session;
        console.log('connected to WAMP router');
    };

    connection.onclose = function (reason, details) {
        WAMPSession = null;
        console.log('connection closed', reason, details);
    };

    connection.open();
}


function set_brightness(brightness, wasRaiseRequest) {
    WAMPSession.call("io.crossbar.set_brightness", [brightness]).then(
        function () {
            wasBrightnessRaised = wasRaiseRequest;
        }
    );
}

function raise() {
    WAMPSession.call("io.crossbar.get_brightness").then(
        function (result) {
            brightnessLowered = result;
            set_brightness(BRIGHTNESS_RAISED, true);
        }
    );
}


function lower() {
    if (brightnessLowered != null) {
        set_brightness(brightnessLowered, false);
    }
}


function startLoop() {
    if (currentTab != null) {
        chrome.windows.get(currentTab.windowId, {"windowTypes": ['normal']}, function(window) {
            if (window.state == "fullscreen") {
                if (!wasBrightnessRaised) {
                    raise();
                }
            } else if (wasBrightnessRaised) {
                lower();
            }
            setTimeout(startLoop, 1000);
        });
    } else {
        if (wasBrightnessRaised) {
            lower();
        }
    }
}

connect_crossbar();


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
