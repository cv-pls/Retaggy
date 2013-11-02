(function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        switch(request.action) {
            case "init":
                chrome.pageAction.show(sender.tab.id);
                sendResponse({result: "ok"});
                break;

            case "openTab":
                chrome.tabs.create({
                    'url': request.url
                }, function(tab) {
                    chrome.tabs.sendMessage(tab.id, {action: "burninateTab", tag: request.tag}, function(response) {
                        //alert(response.result);
                    });
                });
                sendResponse({result: "ok"});
                break;

            default:
                sendResponse({result: "fail"});
                break;
        }
    });
}());
