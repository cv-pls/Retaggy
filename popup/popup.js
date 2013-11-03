function addClass(el, className) {
  var classes = el.className.replace(/^\s+|\s+$/, '').split(/\s+/);
  if (classes.indexOf(className) < 0) {
    classes.push(className);
  }
  el.className = classes.join(' ');
}
function removeClass(el, className) {
  var classes = el.className.replace(/^\s+|\s+$/, '').split(/\s+/);
  if (classes.indexOf(className) > -1) {
    classes.splice(classes.indexOf(className), 1);
  }
  el.className = classes.join(' ');
}

function checkBoxChange() {
  if (this.checked) {
    removeClass(this.parentNode, 'disabled');
    this.parentNode.querySelector('input[type=text]').disabled = false;
  } else {
    addClass(this.parentNode, 'disabled');
    this.parentNode.querySelector('input[type=text]').disabled = true;
  }
}

function serializeForm() {
  var pagesize, tagged, nottagged = [], add = [], remove = [], unless = [], result = {};

  pagesize = document.getElementById('num-questions').value;
  if (pagesize < 1 || pagesize > 100) {
    alert('Number of questions must be between 1 and 100 inclusive');
    return;
  }
  
  tagged = document.getElementById('question-tags').value.replace(/\s+/, '');
  if (tagged === '') {
    alert('You must specify at least one tag to match');
    return;
  }
  tagged = tagged.toLowerCase().split(/\s*;\s*/);

  if (document.getElementById('enable-nottagged').checked) {
    nottagged = document.getElementById('question-nottags').value.replace(/\s+/, '');
    if (nottagged !== '') {
      nottagged = nottagged.toLowerCase().split(/\s*;\s*/);
    }
  }

  if (document.getElementById('enable-add').checked) {
    add = document.getElementById('tag-add').value.replace(/\s+/, '');
    if (add !== '') {
      add = add.toLowerCase().split(/\s*;\s*/);
    }
  }

  if (document.getElementById('enable-remove').checked) {
    remove = document.getElementById('tag-remove').value.replace(/\s+/, '');
    if (remove !== '') {
      remove = remove.toLowerCase().split(/\s*;\s*/);
    }
  }

  if (document.getElementById('enable-unless').checked) {
    unless = document.getElementById('tag-unless').value.replace(/\s+/, '');
    if (unless !== '') {
      unless = unless.toLowerCase().split(/\s*;\s*/);
    }
  }
  
  if (!add.length && !remove.length) {
    alert('No actions to perform, must specify at least one tag to add or remove');
    return;
  }
  
  return {
    pagesize: pagesize,
    tagged: tagged,
    nottagged: nottagged,
    add: add,
    remove: remove,
    unless: unless
  };
}

function initNotRunningPage() {
  document.getElementById('enable-nottagged').addEventListener('change', checkBoxChange);
  document.getElementById('enable-remove').addEventListener('change', checkBoxChange);
  document.getElementById('enable-unless').addEventListener('change', checkBoxChange);
  document.getElementById('enable-add').addEventListener('change', function() {
    var ev;
    checkBoxChange.call(this);
    if (this.checked) {
      document.getElementById('enable-unless').disabled = false;
    } else {
      ev = document.createEvent('HTMLEvents');
      ev.initEvent('change', false, false);
      document.getElementById('enable-unless').checked = false;
      document.getElementById('enable-unless').dispatchEvent(ev);
      document.getElementById('enable-unless').disabled = true;
    }
  });

  document.getElementById('go-button').addEventListener('click', function() {
    var data = serializeForm();
    console.log(data);
    if (data) {
      data.method = 'startProcess';
      chrome.extension.sendMessage(data, function(status) {
        if (status.result) {
          initNotRunningPage();
        } else {
          alert('Error: '+status.message);
        }
      });
    }
  });
  
  document.getElementById('form').style.display = 'block';
  document.getElementById('running-message').style.display = 'none';
}

function initRunningPage() {
  document.getElementById('stop-button').addEventListener('click', function() {
    chrome.extension.sendMessage({method: 'stopProcess'}, function() {
      window.close();
    });
  });

  document.getElementById('form').style.display = 'none';
  document.getElementById('running-message').style.display = 'block';
}

window.addEventListener('DOMContentLoaded', function() {
  chrome.extension.sendMessage({method: 'queryStatus'}, function(status) {
    if (status.running) {
      initRunningPage();
    } else {
      initNotRunningPage();
    }
  });
});