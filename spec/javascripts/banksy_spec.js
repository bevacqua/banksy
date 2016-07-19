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


  xit("autocompletes on selection click in wysiwyg mode and persists insertion point at end", function(done) {

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
        expect(editor.value()).toEqual('hello wysiwyg @');
 
        crossvent.add(editor.editable, 'horsey-selected', onSelect);
 
        crossvent.fabricate($('.sey-list .sey-item:first')[0], "click");

      }, 0);

    }
 
    function onSelect() {

      expect(editor.value()).toEqual('hello wysiwyg @hodor');
  
      editor.runCommand(function(chunks, mode) {
console.log(chunks,"expect insertion point to be at the end");
        // expect insertion point to be at the end
        expect(chunks.before).toEqual('hello wysiwyg @hodor');
        expect(chunks.after).toEqual('');
      });
 
      crossvent.remove($('.sey-list .sey-item:first')[0], 'horsey-hide', onHide);
      crossvent.remove(editor.editable, 'horsey-show', onShow);
      crossvent.remove(editor.editable, 'horsey-selected', onSelect);

      done();
 
    }

    crossvent.add($('.sey-list .sey-item:first')[0], 'horsey-hide', onHide);

    enter('hello wysiwyg'); // clear the horsey

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
 
      expect(editor.value()).toEqual('hello markdown @hodor ');

      editor.runCommand(function(chunks, mode) {
        expect(chunks.before).toEqual('hello markdown @hodor ');
        expect(chunks.after).toEqual('');
      });
 
      crossvent.remove(editor.textarea, 'horsey-show', onShow);
      crossvent.remove(editor.textarea, 'horsey-selected', onSelect);
 
      done();
 
    }

    crossvent.add(editor.textarea, 'horsey-show', onShow);

    // wait for listener to subscribe
    setTimeout(function() {
      enter('hello markdown @');
    }, 0);
    // alternatively, a double keypress can work:
    // crossvent.fabricate(editor.editable, "keypress");

  });


  it("autocompletes two subsequent anchors in wysiwyg mode, the second of which is '@h'", function(done) {

    editor.setMode('wysiwyg');
    editor.value('');
 
    function onShow() {

      // Somehow, dropping priority gives time for this to run; 
      // possibly for the element to appear and/or move?
      setTimeout(function() {

        expect($('.sey-list .sey-item:first').is(':visible')).toBe(true);
        expect(editor.value()).toEqual('hello @bran and @ho');
 
        crossvent.add(editor.editable, 'horsey-selected', onSelect);
 
        crossvent.fabricate($('.sey-list .sey-item:first')[0], "click");

      }, 0);

    }
 
    function onSelect() {
 
      expect(editor.value()).toEqual('hello @bran and @hodor');
 
      crossvent.remove(editor.editable, 'horsey-show', onShow);
      crossvent.remove(editor.editable, 'horsey-selected', onSelect);
 
      done();
 
    }

    crossvent.add(editor.editable, 'horsey-show', onShow);

    enter('hello @bran and @ho');

  });


  xit("autocompletes at the end of a line with existing lines below and retains correct insertion point location", function(done) {
  });


  xit("autocompletes at the end of a line and does not create double @@", function(done) {
  });


  xit("autocompletes @h with enter key and does not move insertion point to start of line", function(done) {
  });

});
