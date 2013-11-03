chrome.extension.sendMessage({method: 'pageInit'}, function(opParams) {
  (new ReTagger(opParams.add, opParams.remove, opParams.unless)).run(function() {
    chrome.extension.sendMessage({method: 'pageComplete'}, function(next) {
      setTimeout(function() {
        window.location.href = next.link;
      }, 1000);
    });
  });
});