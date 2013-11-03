var ReTagger;

(function() {

  function dispatchClick(el) {
    var ev = document.createEvent('MouseEvents');
    ev.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    el.dispatchEvent(ev);
  }

  ReTagger = function(addTags, removeTags, unlessTags) {
    this.addTags = addTags || [];
    this.removeTags = removeTags || [];
    this.unlessTags = unlessTags || [];

    if (!(this.addTags instanceof Array) || !(this.removeTags instanceof Array) || !(this.unlessTags instanceof Array)) {
      throw new TypeError('Tag lists must be arrays');
    }
    if (!this.addTags.length && !this.removeTags.length) {
      throw new Error('No work to do');
    }

    this.tagListEl = document.querySelector('div.post-taglist');
  };

  ReTagger.prototype.removeTags = null;
  ReTagger.prototype.addTags = null;
  ReTagger.prototype.unlessTags = null;

  ReTagger.prototype.completeCallback = null;

  ReTagger.prototype.tagListEl = null;

  ReTagger.prototype.tagListChanged = false;
  ReTagger.prototype.ignoreAddTags = false;

  ReTagger.prototype.checkEditable = function() {
    var self = this;
    
    if (this.tagListEl.querySelector('div.form-item')) {
      setTimeout(function() {
        self.editTags();
      }, 1000);
    } else {
      setTimeout(function() {
        self.checkEditable();
      }, 500);
    }
  };

  ReTagger.prototype.removeTag = function(tagContainerEl) {
    dispatchClick(tagContainerEl.querySelector('span.delete-tag'));
  };

  ReTagger.prototype.waitForSuggestionsBox = function(callBack) {
    var i, l, suggestedTags, self = this, suggestionsBox = this.tagListEl.querySelector('div.tag-suggestions');

    if (suggestionsBox) {
      suggestedTags = suggestionsBox.querySelectorAll('span.post-tag');
      callBack.call(this, suggestedTags);
    } else {
      setTimeout(function() {
        self.waitForSuggestionsBox(callBack);
      }, 500);
    }
  };

  ReTagger.prototype.processAddTags = function() {
    var tagData, input = this.tagListEl.querySelector('div.tag-editor input'), self = this;

    if (!this.ignoreAddTags && this.addTags.length) {
      tagName = this.addTags.shift();
      input.value = tagName;
      dispatchClick(input);
      this.waitForSuggestionsBox(function(suggestedTags) {
        console.log(suggestedTags);

        var i, l, success = false;

        for (i = 0, l = suggestedTags.length; i < l; i++) {
          if (suggestedTags[i].children.length === 1 && suggestedTags[i].querySelector('span.match').firstChild.data === tagName) {
            this.tagListChanged = true;
            dispatchClick(suggestedTags[i].parentNode);
            success = true;
            break;
          }
        }

        if (!success) {
          throw new Error('Invalid tag');
        }
        
        this.processAddTags();
      });
    } else {
      if (this.tagListChanged) {
        dispatchClick(document.getElementById('edit-tags-submit'));
      } else {
        dispatchClick(document.getElementById('edit-tags-cancel'));
      }
      this.waitForEditTagsComplete();
    }
  };

  ReTagger.prototype.waitForEditTagsComplete = function() {
    var self = this;

    if (document.querySelector('a#edit-tags')) {
      if (typeof this.completeCallback === 'function') {
        this.completeCallback.call();
      }
    } else {
      setTimeout(function() {
        self.waitForEditTagsComplete();
      }, 500);
    }
  };

  ReTagger.prototype.processRemoveTags = function() {
    var i, l, tag, tags = this.tagListEl.querySelectorAll('span.post-tag');

    for (i = 0, l = tags.length; i < l; i++) {
      tag = tags[i].firstChild.data;

      if (this.removeTags.indexOf(tag) >= 0) {
        this.tagListChanged = true;
        this.removeTag(tags[i]);
      }
      if (this.addTags.indexOf(tag) >= 0) {
        this.addTags.splice(this.addTags.indexOf(tag), 1);
      }
      if (this.unlessTags.indexOf(tag) >= 0) {
        this.ignoreAddTags = true;
      }
    }
  };

  ReTagger.prototype.editTags = function() {
    this.processRemoveTags();
    this.processAddTags();
  };

  ReTagger.prototype.run = function(completeCallback) {
    var self = this;

    if (typeof completeCallback === 'function') {
      this.completeCallback = completeCallback;
    }

    dispatchClick(document.getElementById('edit-tags'));
    setTimeout(function() {
      self.checkEditable();
    }, 500);
  };

}());