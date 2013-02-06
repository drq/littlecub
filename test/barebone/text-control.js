(function() {

    module("controls: text");

    // Test case 1 : Simple text control with only string data input.
    test("Simple text control with only string data input", function() {
        expect(3);
        var divElem = document.getElementById('text-1');
        var textControl1 = LittleCub("Sample1", null, null, divElem);
        var inputElem = divElem.querySelector('input[type=text]');
        ok(inputElem, 'Text input field generated.');
        equal(inputElem, textControl1.field, 'Control field populated correctly.');
        equal(inputElem.value, 'Sample1', 'Input field value populated correctly.');
    });

}());
