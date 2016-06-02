var editor, el, horse, bridge;

describe("Banksy", function() {

  beforeAll(function() {

    el = $('#woofmark')[0];

    editor = woofmark(el, {
      parseMarkdown: megamark,
      parseHTML:     domador
    });

    horse = horsey(el, {
      anchor: '@',
      suggestions: [
        { value: '@hodor',  text: 'Hodor' }
      ],
      set: function (value) {
        if (wysiwyg.mode === 'wysiwyg') {
          editor.editable.innerHTML = value;
        } else {
          editor.textarea.value = value;
        }
      }
    });

    bridge = banksy(el, {
      editor: editor,
      horse: horse
    });

    enter = function(before, after) {

      before = before || "";
      after  = after  || "";

      editor.runCommand(function(chunks, mode) {
        chunks.before = chunks.before + before;
        chunks.after = after + chunks.after;
      });
 
      // trigger the horsey:
      crossvent.fabricate(el, "keypress");

    }

  });


  it("initializes", function() {

    expect($('.sey-list')).not.toBe(null);
    expect($('.sey-list .sey-item').html()).toBe("Hodor");

  });


  it("displays on @ token entry", function(done) {

    editor.value('');
    editor.setMode('wysiwyg');

    enter('hello');
    expect($('.sey-list .sey-item:first').is(':visible')).toBe(false);

    function onShow() {

      expect($('.sey-list .sey-item:first').is(':visible')).toBe(true);
      expect(editor.value()).toEqual('hello @');

      crossvent.remove(editor.editable, 'horsey-show', onShow);

      done();

    }

    enter(' @');

    crossvent.add(editor.editable, 'horsey-show', onShow);

  });


  it("autocompletes on selection click in wysiwyg mode", function(done) {

    editor.setMode('wysiwyg');
    editor.value('');

    function onHide() {

      expect($('.sey-list .sey-item:first').is(':visible')).toBe(false);

      crossvent.add(editor.editable, 'horsey-show', onShow);

      enter(' @');

    }
 
    function onShow() {

      // Somehow, dropping priority gives time for this to run; 
      // possibly for the element to appear and/or move?
      setTimeout(function() {

        expect($('.sey-list .sey-item:first').is(':visible')).toBe(true);
        expect(editor.value()).toEqual('hello again @');
 
        crossvent.add(editor.editable, 'horsey-selected', onSelect);
 
        crossvent.fabricate($('.sey-list .sey-item:first')[0], "click");

      }, 0);

    }
 
    function onSelect() {
 
      expect(editor.value()).toEqual('hello again @hodor');
 
      crossvent.remove($('.sey-list .sey-item:first')[0], 'horsey-hide', onHide);
      crossvent.remove(editor.editable, 'horsey-show', onShow);
      crossvent.remove($('.sey-list .sey-item:first')[0], 'horsey-hide', onSelect);
 
      done();
 
    }

    crossvent.add($('.sey-list .sey-item:first')[0], 'horsey-hide', onHide);

    enter('hello again'); // clear the horsey

  });


  it("autocompletes on selection click in markdown mode", function(done) {

    editor.setMode('markdown');
    editor.value('');
 
    function onShow() {

      // Somehow, dropping priority gives time for this to run; 
      // possibly for the element to appear and/or move?
      setTimeout(function() {

        expect($('.sey-list .sey-item:first').is(':visible')).toBe(true);
        expect(editor.value()).toEqual('hello markdown @');
 
        crossvent.add(editor.textarea, 'horsey-selected', onSelect);
 
        crossvent.fabricate($('.sey-list .sey-item:first')[0], "click");

      }, 0);

    }
 
    function onSelect() {
 
      expect(editor.value()).toEqual('hello markdown @hodor');
 
      crossvent.remove(editor.textarea, 'horsey-show', onShow);
      crossvent.remove($('.sey-list .sey-item:first')[0], 'horsey-hide', onSelect);
 
      done();
 
    }

    crossvent.add(editor.textarea, 'horsey-show', onShow);

    // wait for listener to subscribe
    setTimeout(function() {
      enter('hello markdown @');
    }, 0);

  });


});
