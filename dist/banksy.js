(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.banksy = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"crossvent":3}],2:[function(require,module,exports){
(function (global){

var NativeCustomEvent = global.CustomEvent;

function useNative () {
  try {
    var p = new NativeCustomEvent('cat', { detail: { foo: 'bar' } });
    return  'cat' === p.type && 'bar' === p.detail.foo;
  } catch (e) {
  }
  return false;
}

/**
 * Cross-browser `CustomEvent` constructor.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent.CustomEvent
 *
 * @public
 */

module.exports = useNative() ? NativeCustomEvent :

// IE >= 9
'function' === typeof document.createEvent ? function CustomEvent (type, params) {
  var e = document.createEvent('CustomEvent');
  if (params) {
    e.initCustomEvent(type, params.bubbles, params.cancelable, params.detail);
  } else {
    e.initCustomEvent(type, false, false, void 0);
  }
  return e;
} :

// IE <= 8
function CustomEvent (type, params) {
  var e = document.createEventObject();
  e.type = type;
  if (params) {
    e.bubbles = Boolean(params.bubbles);
    e.cancelable = Boolean(params.cancelable);
    e.detail = params.detail;
  } else {
    e.bubbles = false;
    e.cancelable = false;
    e.detail = void 0;
  }
  return e;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(require,module,exports){
(function (global){
'use strict';

var customEvent = require('custom-event');
var eventmap = require('./eventmap');
var doc = document;
var addEvent = addEventEasy;
var removeEvent = removeEventEasy;
var hardCache = [];

if (!global.addEventListener) {
  addEvent = addEventHard;
  removeEvent = removeEventHard;
}

function addEventEasy (el, type, fn, capturing) {
  return el.addEventListener(type, fn, capturing);
}

function addEventHard (el, type, fn) {
  return el.attachEvent('on' + type, wrap(el, type, fn));
}

function removeEventEasy (el, type, fn, capturing) {
  return el.removeEventListener(type, fn, capturing);
}

function removeEventHard (el, type, fn) {
  return el.detachEvent('on' + type, unwrap(el, type, fn));
}

function fabricateEvent (el, type, model) {
  var e = eventmap.indexOf(type) === -1 ? makeCustomEvent() : makeClassicEvent();
  if (el.dispatchEvent) {
    el.dispatchEvent(e);
  } else {
    el.fireEvent('on' + type, e);
  }
  function makeClassicEvent () {
    var e;
    if (doc.createEvent) {
      e = doc.createEvent('Event');
      e.initEvent(type, true, true);
    } else if (doc.createEventObject) {
      e = doc.createEventObject();
    }
    return e;
  }
  function makeCustomEvent () {
    return new customEvent(type, { detail: model });
  }
}

function wrapperFactory (el, type, fn) {
  return function wrapper (originalEvent) {
    var e = originalEvent || global.event;
    e.target = e.target || e.srcElement;
    e.preventDefault = e.preventDefault || function preventDefault () { e.returnValue = false; };
    e.stopPropagation = e.stopPropagation || function stopPropagation () { e.cancelBubble = true; };
    e.which = e.which || e.keyCode;
    fn.call(el, e);
  };
}

function wrap (el, type, fn) {
  var wrapper = unwrap(el, type, fn) || wrapperFactory(el, type, fn);
  hardCache.push({
    wrapper: wrapper,
    element: el,
    type: type,
    fn: fn
  });
  return wrapper;
}

function unwrap (el, type, fn) {
  var i = find(el, type, fn);
  if (i) {
    var wrapper = hardCache[i].wrapper;
    hardCache.splice(i, 1); // free up a tad of memory
    return wrapper;
  }
}

function find (el, type, fn) {
  var i, item;
  for (i = 0; i < hardCache.length; i++) {
    item = hardCache[i];
    if (item.element === el && item.type === type && item.fn === fn) {
      return i;
    }
  }
}

module.exports = {
  add: addEvent,
  remove: removeEvent,
  fabricate: fabricateEvent
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./eventmap":4,"custom-event":2}],4:[function(require,module,exports){
(function (global){
'use strict';

var eventmap = [];
var eventname = '';
var ron = /^on/;

for (eventname in global) {
  if (ron.test(eventname)) {
    eventmap.push(eventname.slice(2));
  }
}

module.exports = eventmap;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});