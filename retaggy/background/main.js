(function() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        switch(request.action) {
            case "init":
                chrome.pageAction.show(sender.tab.id);
                sendResponse({result: "ok"});
                break;

            default:
                sendResponse({result: "fail"});
                break;
        }
    });
}());
