var editor;

describe("Banksy", function() {

  beforeAll(function() {

    editor = woofmark($('#woofmark')[0], {
      parseMarkdown: megamark,
      parseHTML:     domador
    });

  });


  it("initializes", function() {

    var horse = horsey(editor.editable, {
      anchor: '@',
      suggestions: [
        '@hodor'
        //{ value: '@hodor',  text: 'Hodor'   },
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

    expect($('.sey-list')).not.toBe(null);

  });


});
