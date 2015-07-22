'use strict';

var crossvent = require('crossvent');

function banksy (el, options) {
  var o = options || {};
  var editor = o.editor;
  var horse = o.horse;
  var woofmarkLastMode;
  var cachedChunks;
  var cachedNeedle;
  var ranchorleft;
  var ranchorright;

  if (horse.anchor) {
    ranchorleft = new RegExp('^' + horse.anchor);
    ranchorright = new RegExp(horse.anchor + '$');
  }
  horse.appendText = appendText;
  horse.appendHTML = appendHTML;
  horse.filterAnchoredHTML = filterAnchoredHTML;
  inputEvents();

  return {
    destroy: destroy
  };

  function destroy () {
    inputEvents(true);
    horse.destroy();
  }

  function inputEvents (remove) {
    var op = remove ? 'remove' : 'add';
    crossvent[op](editor.editable, 'horsey-filter', getChunksForFilters);
    crossvent[op](editor.textarea, 'woofmark-mode-change', woofmarkModeChanged);
  }

  function woofmarkModeChanged () {
    if (editor.mode !== woofmarkLastMode) {
      horse.retarget(editor.mode === 'wysiwyg' ? editor.editable : editor.textarea);
    }
    woofmarkLastMode = editor.mode;
  }

  function entitize (value) {
    var rparagraph = /^<p>|<\/p>\n?$/g;

    if (editor.mode !== 'markdown') {
      return editor.parseMarkdown(value).replace(rparagraph, '');
    }
    return value;
  }

  function getChunksForFilters () {
    editor.runCommand(function gotContext (chunks) {
      var text = chunks.before + chunks.selection;
      var anchored = false;
      var start = text.length;
      if (ranchorleft) {
        while (anchored === false && start >= 0) {
          cachedNeedle = text.substr(start - 1, text.length - start + 1);
          anchored = ranchorleft.test(cachedNeedle);
          start--;
        }
      }
      if (anchored === false) {
        cachedNeedle = null;
      }
      cachedChunks = chunks;
    });
  }

  function appendText (value) {
    var entity = entitize(value);
    horse.defaultAppendText(entity);
  }

  function appendHTML (value) {
    editor.runCommand(setEntity);
    function setEntity (chunks) {
      var entity = entitize(value);
      var left = cachedChunks.before;
      var len = left.length - 1;
      while (len > 0 && (!ranchorright || !ranchorright.test(left))) {
        left = left.substr(0, --len);
      }
      chunks.before = left.substr(0, len) + entity + '&nbsp;';
      chunks.after = cachedChunks.selection + cachedChunks.after;
      chunks.selection = '';
    }
  }

  function filterAnchoredHTML (q, suggestion) {
    if (cachedNeedle) {
      return { input: cachedNeedle, suggestion: suggestion };
    }
  }
}

banksy.find = find;
module.exports = banksy;
