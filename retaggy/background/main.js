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
                    chrome.tabs.onUpdated.addListener(function(tabId, info) {
                        if (info.status == "complete" && tab.id == tabId) {
                            chrome.tabs.sendMessage(tab.id, {action: "burninateTab", tag: request.tag, id: tab.id}, function(response) {});
                        }
                    });
                });
                sendResponse({result: "ok"});
                break;

            case "closeTab":
                chrome.tabs.remove(request.id, function() { });
                break;

            default:
                sendResponse({result: "fail"});
                break;
        }
    });
}());
