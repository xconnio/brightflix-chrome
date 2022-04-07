/*
* Copyright (C) 2018-2019 Omer Akram
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

const URL_NETFLIX = "https://";
const PROCEDURE_BRIGHTNESS_SET = "org.deskconn.deskconn.brightness.set";
const PROCEDURE_BRIGHTNESS_GET = "org.deskconn.deskconn.brightness.get";

let currentTab = null;
let wasBrightnessRaised = false;
let brightnessLowered = null;
let wamp_session = null;


let connection = new autobahn.Connection({url: 'ws://localhost:5020/ws', realm: 'deskconn'});
connection.onopen = function (session, details) {
    wamp_session = session;
};

connection.onclose = function (reason) {
    wamp_session = null;
};
connection.open();


function set_brightness(brightness) {
    if (wamp_session == null) {
        return;
    }
    wamp_session.call(PROCEDURE_BRIGHTNESS_SET, [brightness]).then(
        function (response) {
            wasBrightnessRaised = true;
        },
        function (error) {
            console.log(error);
        }
    );
}

function raise() {
    if (wamp_session == null) {
        return;
    }
    wamp_session.call(PROCEDURE_BRIGHTNESS_GET).then(
        function (response) {
            brightnessLowered = response;
            chrome.storage.local.get({"brightness": 70}, function (result) {
                set_brightness(result.brightness);
                console.log('Value currently is ' + result.brightness);
            });
        },
        function (error) {
            console.log(error);
        }
    );
}

function lower() {
    if (brightnessLowered != null) {
        set_brightness(brightnessLowered);
    }
}

function startLoop() {
    if (currentTab != null) {
        chrome.windows.get(currentTab.windowId, {"windowTypes": ['normal']}, function (window) {
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

chrome.tabs.onActivated.addListener(function (info) {
    chrome.tabs.get(info.tabId, function (tab) {
        if (tab.url.startsWith(URL_NETFLIX)) {
            currentTab = tab;
            startLoop();
        } else {
            currentTab = null;
        }
    });
});