(function() {
    chrome.runtime.sendMessage({action: "init"}, function(response) {
        var questions = document.querySelectorAll('.question-hyperlink');

        for (var i = 0, l = questions.length; i < l; i++) {
            questions[i].parentNode.removeChild(questions[i]);
        }
    });
}());