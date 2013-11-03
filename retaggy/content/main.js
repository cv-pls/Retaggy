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

    function runOnUrl(url, tag) {
        handle(url);

        chrome.runtime.sendMessage({
            action: "openTab",
            url: "http://stackoverflow.com" + url,
            tag: tag
        }, function(response) {
            console.log(response);
        });
    }

    function runBurninator(urls, tag) {
        if (!urls.length) {
            return;
        }

        runOnUrl(urls.shift(), tag);

        var interval = setInterval(function() {
            if (!urls.length) {
                clearInterval(interval);
                return;
            }

            runOnUrl(urls.shift(), tag);
        }, 5000);
    }

    function burninate(tag) {
        reset();

        var questions = document.querySelectorAll('.question-hyperlink');
        var urls = [];

        for (var i = 0, l = questions.length; i < l; i++) {
            if (isHandled(tag)) {
                continue;
            }

            urls.push(questions[i].getAttribute('href'));

            // uncomment for debugging so only one question will be processed
            //break;
        }

        runBurninator(urls, tag);

        return 'ok';
    }

    chrome.runtime.sendMessage({action: "init"}, function(response) {});

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === "burninate") {
            sendResponse({result: burninate(request.tag)});
        }

        if (request.action === "burninateTab") {
            var click = document.createEvent("HTMLEvents");
            click.initEvent('click', true, true );

            var tagsList = document.getElementById('edit-tags').parentNode.parentNode.parentNode;

            document.getElementById('edit-tags').dispatchEvent(click);

            setTimeout(function() {
                var tags = tagsList.querySelectorAll('span.post-tag');

                if (tags.length == 1) {
                    return;
                }

                for (var i = 0, l = tags.length; i < l; i++) {
                    if (tags[i].childNodes[0].nodeValue != request.tag) {
                        continue;
                    }

                    tags[i].querySelector('.delete-tag').dispatchEvent(click);

                    document.getElementById('edit-tags-submit').dispatchEvent(click);

                    setTimeout(function() {
                        chrome.runtime.sendMessage({action: "closeTab", id: request.id}, function(response) {});
                    }, 2000);

                    sendResponse({result: 'ok'});

                    break;
                }

                sendResponse({result: 'ok'});
            }, 1000);
        }
    });
}());
