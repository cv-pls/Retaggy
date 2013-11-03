(function() {
    document.getElementById('burninate').addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "burninate", tag: document.querySelector('input[type="text"]').value}, function(response) {
                //alert(response.result);
            });
        });
    });
}());
