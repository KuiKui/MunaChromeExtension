// minify using http://gpbmike.github.io/refresh-sf/

var muna_domain = 'muna.dev';
var muna_scheme = 'http';

var Muna = {
    saveUrl: muna_scheme + '://' + muna_domain + '/save',
    loginUrl: muna_scheme + '://' + muna_domain + '/login',
    animationLength: 0.15,
    feedbackDivDestroyDelay: 200
};

window.Muna = Muna;

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

Muna.applyStyles = function(element, styles) {
    for (prop in styles) {
        element.style[prop] = styles[prop];
    }
}

Muna.save = function(url) {
    var feedback = document.createElement('div');
    feedback.id = 'muna-feedback';

    Muna.applyStyles(feedback, {
        position: 'fixed',
        width: '100%',
        left: 0,
        backgroundColor: 'white',
        borderBottomWidth: '5px',
        borderBottomColor: 'green',
        borderBottomStyle: 'solid',
        zIndex: 9999,
        top: '-1000px'
    });

    var feedback_inner = document.createElement('p');
    feedback_inner.innerHTML = 'Saving...';

    Muna.applyStyles(feedback_inner, {
        fontSize: '24pt',
        fontFamily: 'Arial',
        lineHeight: '32pt',
        color: 'black',
        padding: '1em',
        margin: 0,
        textAlign: 'center'
    });

    feedback.appendChild(feedback_inner);
    document.body.appendChild(feedback);

    feedback.style.top = -feedback.offsetHeight + 'px';

    setTimeout(function() {
        feedback.style.transition = 'top ' + Muna.animationLength + 's linear';
        feedback.style.top = '0px';
    }, 10);

    function schedule_bar_out(delay) {
        // return;
        // setTimeout(function() { Muna.slideOut(feedback); }, 1500);
        setTimeout(function() {
            feedback.style.top = -(feedback.offsetHeight + 1) + 'px'
            setTimeout(function() { document.body.removeChild(feedback) }, Muna.feedbackDivDestroyDelay);
        }, delay || 1500)
    }

    var success = function(responseText, status, xhr) {
        try {
            var data = JSON.parse(responseText);
        } catch (e) {
            return error(responseText, status, xhr);
        }

        feedback_inner.innerHTML = data.message || 'Page saved!';
        schedule_bar_out();
    }

    var error = function(responseText, status, xhr) {
        feedback.style.borderBottomColor = 'red';

        try {
            var data = JSON.parse(responseText);
        } catch (e) {
            // most likely the user is not logged in
            // we will need this globally
            Muna.schedule_bar_out = schedule_bar_out;
            feedback_inner.innerHTML = 'You do not seem to be logged in. <a style="color: blue;" onclick="javascript:Muna.schedule_bar_out(0)" href="' + Muna.loginUrl + '" target="_blank">Login</a>.';
            return;
        }

        feedback_inner.innerHTML = data.message || 'Error :(';
    }

    var xhr = Muna.ajax(success, error);

    try {
        var title = document.getElementsByTagName('title')[0].innerText;
    } catch (e) {
        var title = '';
    }

    xhr.open('POST', Muna.saveUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send('url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title));

    return xhr;
};

window.Muna.save("test-denis");
