var muna_domain = 'muna.io';
var muna_scheme = 'http';

var Muna = {
    saveUrl: muna_scheme + '://' + muna_domain + '/save',
    loginUrl: muna_scheme + '://' + muna_domain + '/login',
    tab: null
};

Muna.ajax = function(success, error) {
    var xhr;

    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    xhr.withCredentials = true;

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            if (xhr.status < 400) {
                success(xhr.responseText, xhr.status, xhr);
            } else {
                error(xhr.responseText, xhr.status, xhr);
            }
        }
    };

    return xhr;
};

Muna.save = function() {
    var success = function(responseText, status, xhr) {
        try {
            var data = JSON.parse(responseText);
        } catch (e) {
            return error(responseText, status, xhr);
        }

        Muna.log('Page saved!');

        return;
    }

    var error = function(responseText, status, xhr) {
        try {
            var data = JSON.parse(responseText);
        } catch (e) {
            // most likely the user is not logged in
            // we will need this globally
            Muna.alert('You do not seem to be logged in.');

            return;
        }

        Muna.alert(data.message || 'Error :(');

        return;
    }

    var xhr = Muna.ajax(success, error);

    xhr.open('POST', Muna.saveUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('url=' + encodeURIComponent(Muna.tab.url) + '&title=' + encodeURIComponent(Muna.tab.title));

    return xhr;
};

Muna.alert = function(message) {
    chrome.tabs.executeScript(Muna.tab.id, {code:"alert('Muna.io error : " + message + "');"});
}

Muna.log = function(message) {
    chrome.tabs.executeScript(Muna.tab.id, {code:"console.log('" + message + "');"});
}

chrome.browserAction.onClicked.addListener(function (tab) {
    Muna.tab = tab;
    Muna.save();
});
