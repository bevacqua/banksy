var editor;

describe("Banksy", function() {

  beforeAll(function() {

    editor = woofmark($('#woofmark')[0], {
      parseMarkdown: megamark,
      parseHTML:     domador
    });

    var horse = horsey(editor.editable, {
      anchor: '@',
      suggestions: [
        { value: '@hodor',  text: 'Hodor' }
      ],
      set: function (value) {
        if (wysiwyg.mode === 'wysiwyg') {
          editor.textarea.innerHTML = value;
        } else {
          editor.textarea.value = value;
        }
      }
    });

    var bridge = banksy(editor.textarea, {
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
      crossvent.fabricate(editor.editable, "keypress");

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

    enter(' @');

    var onShow = function() {

      expect($('.sey-list .sey-item:first').is(':visible')).toBe(true);
      expect(editor.value()).toEqual('hello @');

      crossvent.remove(editor.editable, 'horsey-show', onShow);
      done();

    }

    crossvent.add(editor.editable, 'horsey-show', onShow);

  });


  it("autocompletes on selection click", function(done) {

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

        expect($('.sey-list .sey-item:first').is(':visible')).toBe(true); // fails
        expect(editor.value()).toEqual('hello again @');
 
        crossvent.add(editor.editable, 'horsey-selected', onSelect);
 
        crossvent.fabricate($('.sey-list .sey-item:first')[0], "click");

      }, 0);

    }
 
    function onSelect() {
 
      expect(editor.value()).toEqual('hello again @hodor'); // fails
 
      crossvent.remove($('.sey-list .sey-item:first')[0], 'horsey-hide', onHide);
      crossvent.remove(editor.editable, 'horsey-show', onShow);
      crossvent.remove($('.sey-list .sey-item:first')[0], 'horsey-hide', onSelect);
 
      done();
 
    }

    crossvent.add($('.sey-list .sey-item:first')[0], 'horsey-hide', onHide);

    enter('hello again'); // clear the horsey

  });


});
