(function() {
    function reset() {
        localStorage.removeItem('urls');
    }

    function isHandled(url) {
        var storedUrls = localStorage.getItem('urls');
        var urls = [];

        if (storedUrls !== null) {
            urls = JSON.parse(storedUrls);
        }

        for (var i = 0, l = urls.length; i < l; i++) {
            if (urls[i] == url) {
                return true;
            }
        }

        return false;
    }

    function handle(url) {
        var storedUrls = localStorage.getItem('urls');
        var urls = [];

        if (storedUrls !== null) {
            urls = JSON.parse(storedUrls);
        }

        urls.push(url);

        localStorage.setItem('urls', JSON.stringify(urls));
    }

    function burninate(tag) {
        reset();

        var questions = document.querySelectorAll('.question-hyperlink');

        for (var i = 0, l = questions.length; i < l; i++) {
            if (isHandled(tag)) {
                continue;
            }

            handle(questions[i].getAttribute('href'));

            chrome.runtime.sendMessage({
                action: "openTab",
                url: "http://stackoverflow.com" + questions[i].getAttribute('href'),
                tag: tag
            }, function(response) {
                console.log(response);
            });

            break;
        }

        return 'ok';
    }

    chrome.runtime.sendMessage({action: "init"}, function(response) {
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "burninate") {
            sendResponse({result: burninate(request.tag)});
        }

        if (request.action === "burninateTab") {
            alert(request.tag);

            sendResponse({result: burninate(request.tag)});
        }
    });
}());