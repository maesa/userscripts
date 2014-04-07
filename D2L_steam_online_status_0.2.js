// ==UserScript==
// @name        Dota 2 Lounge steam online status
// @namespace   http://maesa.web.id
// @version     0.2
// @author      Maesa Randi
// @description Displays player steam online status
// @license     GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @include     /^http(s)?://(www.)?dota2lounge.com//
// @exclude     /^http(s)?://(www.)?dota2lounge.com/break/
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// ==/UserScript==

var page_title = "Dota 2 Lounge - Marketplace, Trades, Bets";

var profilePanel = document.querySelector('div.profilesmallheader');
var extraPanel = document.createElement('div');
extraPanel.innerHTML = "<span class='scriptStatus'>Loading</span>" +
    "<button type='button' class='extraButton' id='refreshButton' title='Refresh status'/>" +
    "<button type='button' class='extraButton' id='steamCommunityButton' title='Show profile in steamcommunity'/>";
extraPanel.setAttribute("id", "extraPanel");

var menu = document.querySelector('ul#menu');
var extraMenu = document.createElement('li');
extraMenu.innerHTML = "<img src ='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAACmklEQVRIibWUPWgUURSF" + 
    "v7MuVpLCBAWJkEpUbAIp/NuZRcUiIFgEC7EXgiDMIqa1s9nBn8rCQjTgL6bQxmpnNgQUDYgawUpCULBQC5EgIcdiJpvdySKJurc6M/e9c+49770LPQ71irj" + 
    "eCPZLvNzUC/K4URkE3kj0l+uN4BSw638KGA8jSqBHZYlhYALnWUEL/3UIzEdEWjZuCk0gaob7skHCGOVqhhbONmdrsnLX4BHgMXAnCtPlktAMeBm8pxamC4" + 
    "Yl22CwjU0HtjPB7HsVY3+Jqs0F8NHcgtsrhlBPgteYzbVquidOgjc2+zZuiyuSZm0+A3O1anoAoJwnp4HxOAkGwDclbc/NKBjkrCILlB9UC2vB5qREH+bWi" + 
    "mwmYJoS47YP16rNKxuvPos4qdwAFi3d7xCQNOOsoAowVW9UDoIurIdU8DyqppfjJNhhcwQxVQvTr50d4HlJ85jD2SZtRd5vC+VWrGJhG6k1BL5nJvgMUFZ+" + 
    "uG0FrLQXTGLGjPtr1eaP9RsDcRKAeQcMIHZGYfqr0AEATcunhUbjJHixEQHbuxF7ZV1rJy8KTOcX5l5mAflTyy1q4U6LOjC+RSHaBeaQLoJLqyTZ4wRaWFo" + 
    "hzBJCZcwl4K2k2aLAP4/reiMYRX4qdD4K02t/6iDbkFSQCQyDkqajMJ3vRhwnQR9w3PZZWUuIu93Wlbr8uwpKhCYx7+MkGFlbdWUA8xrzQOgY8An7ezeBDo" + 
    "viJNgCfDMur6a9BCwV5ngJ2NxJpBNRmD4pChQtKgEl8gmcz6N5oO3whO0hZWO5/RZ1c2PtIcdJ5TrWufxzETgaVdOZQqfbMK+AwZxlFjgUheniOgSCEjCKG" + 
    "UI8i8L0Q7fK4kawFXkMtGj7Ya3a/NltXc/jN2M5OBUUQchuAAAAAElFTkSuQmCC' alt= 'Steam store status'>" +
    "<span id='storeStatus'>Loading</span>" +
    "<audio id='notification_sound' src='data:audio/mpeg;base64,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' preload='auto'></audio>"; 
extraMenu.setAttribute("id","steamstatus");

// ...and append it.
if (profilePanel) { //jika tidak ditemukan handle profile panel, akan muncul error, maka harus di-filter
    profilePanel.appendChild(extraPanel);
}
menu.appendChild(extraMenu);

var intervalNotification;
var intervalStore;
$(window).load( function() {
        if (profilePanel) { //jika tidak ditemukan handle profile panel, akan muncul error, maka harus di-filter
            getOnlineStatus();
        }
        getNotificationTotal();
        getStoreStatus();
        //delay and call these functions every 60 seconds
        intervalNotification = window.setInterval(getNotification, 60000);
        intervalStore = window.setInterval(getStoreStatus, 60000);
    }
);

if (profilePanel) { //jika tidak ditemukan handle profile panel, akan muncul error, maka harus di-filter
    var refreshButton = document.getElementById("refreshButton");
    var getOnlineStatus = function () {

        var onlineStatusRegExp = /<div class=\"profile_in_game_header\">(.*?)<\/div>/i;
        var url = "http://steam.maesa.web.id/get_player_status.php?url=" + getSteamcommunityURL();
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            timeout : 5000,
            onload: function (response) {
                var httpResponse = response.responseText;
                var status_json = JSON.parse(httpResponse);
                var status = "Offline";
                if (status_json.is_online == 1) {
                    status = "Online";
                }
                document.querySelector(".scriptStatus").innerHTML = status;
            },
            ontimeout: function() {
                document.querySelector(".scriptStatus").innerHTML = "Unknown";
            }
        });
    };
}

var getStoreStatus = function() {
    var json_address = "http://steamstat.us/status.json";
    GM_xmlhttpRequest({
        method: "GET",
        url: json_address,
        timeout : 5000,
        onload: function (response) {
            var httpResponse = response.responseText;
            var status_json = JSON.parse(httpResponse);
            document.querySelector("#storeStatus").innerHTML = "Steam store is " + status_json.services.store.title;
        },
        ontimeout: function() {
            document.querySelector("#storeStatus").innerHTML = "Steam store is unreachable";
        }
    });
}

//set event listeners
if (profilePanel) { //jika tidak ditemukan handle profile panel, akan muncul error, maka harus di-filter
    refreshButton.addEventListener(
        'click', 
        function(){
            document.querySelector(".scriptStatus").innerHTML = "Refreshing"; 
            getOnlineStatus();
        }, 
        true);

    var steamCommunityButton = document.getElementById("steamCommunityButton");
    steamCommunityButton.addEventListener(
        'click', 
        function() {
            var url = getSteamcommunityURL();
            var win = window.open(url, "_blank");
            if (win) {
                // Browser has allowed it to be opened.
                win.focus();
            } else {
                // Broswer has blocked it.
                alert('Please allow popups for this site in order to open the Steam market listings.');
            }
        },
        true);
}

var menuStoreStatus = document.getElementById("steamstatus");
menuStoreStatus.addEventListener(
    'click',
    function() {
        document.querySelector("#storeStatus").innerHTML = "Refreshing";
        getStoreStatus();
    },
    true);

//Computes the URL used to access the Steamcommunity.
var getSteamcommunityURL = function() {

    var userIDRegExp = /\d+/i;
    var profile = document.querySelector('div.profilesmallheader > a');
    var url = "http://steamcommunity.com/profiles/" + userIDRegExp.exec(profile.getAttribute('href')) + "/";

    return url;
}

var getNotification = function() {
    var mytrade_url = "http://dota2lounge.com/mytrades";
    var myoffer_url = "http://dota2lounge.com/myoffers";

    //get notification for trade
    GM_xmlhttpRequest({
        method: "GET",
        url: mytrade_url,
        onload: function (response) {
            var httpResponse = response.responseText;
            var notifications = httpResponse.match(/(new offers)/gi);
            if (notifications) {
                var is_title_changed = document.title.match(/(\(\d+\))/i);  //page title contain any_decimal_number in bracket
                if ((document.URL != 'http://dota2lounge.com/addtrade') && (!is_title_changed)){
                    location.reload();
                }
            }
        }
    });

    //get notification for offer
    GM_xmlhttpRequest({
        method: "GET",
        url: myoffer_url,
        onload: function (response) {
            var httpResponse = response.responseText;
            var notifications = httpResponse.match(/(New Reply)/gi);
            if (notifications) {
                var is_title_changed = document.title.match(/(\(\d+\))/i); //page title contain any_decimal_number in bracket
                if ((document.URL != 'http://dota2lounge.com/addtrade') && (!is_title_changed)){
                    location.reload();
                }              
            }
        }
    });

}

var getNotificationTotal = function() {
    var totalNotification = 0;
    var notifications = document.querySelectorAll('.notification');
    if (notifications.length > 0) {
        for (var i = 0; i < notifications.length; i++) {
            var x = notifications[i].innerHTML
            totalNotification += parseInt(x.match(/(\d+)/i));
        };
        document.title = '(' + totalNotification + ') ' + page_title;
        document.getElementById('notification_sound').play();
    }
}

//Style.
GM_addStyle("#steamCommunityButton { background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9sIBhUuIxK7S5QAAAFbSURBVDjLY7x27QaDoYGhOQMDwwkGHEBEVJiBgYGBwcLalOHE0dMMb16/ZWBgYGA4f+E8IwM7G+d/fDg4LPD/8VNH/yOD46eO/ufh5P3Pzsb5H68B0tIycM08nLxwDDOEKANgmheumf3//////xeumQ0XJ2hAcFgg3ABkAOPHRsf9Z2LAA0rr8+HsRWvnwGl+IX6EIly29/T0wG3ctm0bShjk5mcjvBAcFojT7/hAbHQcxACYQElx6f+S4tL/e/bvxKtx4rT+/9LSMnDLGLApkpaWwTCopLgUq1cZcNkE88bxU0dRbETHTLDQxQUcbFzgSRcbYEmLymPYE3qYIbsqiWFq2zyGyOgIuOTJawcZCAEWBgYGhlWrV0PieMlCBhkZWQYGBgaGtbuWMKyZt5U4A2CGyCvKMaxZv5KBgYGBYc28DQzLVywnaADjlcvXGYyNjf4zkAHOnj3HDAAt54OFwXNyhAAAAABJRU5ErkJggg==) no-repeat left center; }");
GM_addStyle(".extraButton { margin-left: 0.3em; vertical-align: top; margin-top: -0.1em; border: 0; padding: 0; width: 16px; height: 16px; }");
GM_addStyle("#refreshButton { background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABOUlEQVQ4jc2RsUoDQRCGv32CXECzdjaWRiOCVSA+RdqAL6BFesUXOPUFbCWKJ2thkcRgxCa3cJUEQuCwExRjCi1sxiKXsElO6wz81e58888/sPhlESwxlhNaeP/+zRnO/wCMNaBDIbVZG/ztppLcLYdpgK3uSFgGc05WAnbX7pTcD5FCQ8lyMDOlQ4mQaO8lcRI6Q7wATxsGR32k9YUc9RFtiL1gZsoTq1jk7D3JxLEeFNtKLj6ZqNhWkppHSOvxO3GRFlb3J3mc2VEb/I2mktM3Jtp5UKINgUuProYJoMO+C8jWyGhDXO0hl0Ok2hutma2RcR1UsMjx6ySoA9fJkqGUryu5+UDydSW5azbn1wiJyjFSjp3bO4lrg19opJzacZEhJMIi688juYBkFT+9eRpUGYOmbr6Q9QvwBrFqSdh8NgAAAABJRU5ErkJggg==) no-repeat left center; }");
GM_addStyle("#steamstatus {cursor: pointer; cursor: hand;color : #8EC13E} #storeStatus {color : #8EC13E} ");
