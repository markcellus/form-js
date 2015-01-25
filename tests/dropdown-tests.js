define([
    'sinon',
    'qunit',
    'test-utils',
    'src/form'
], function(
    Sinon,
    QUnit,
    TestUtils,
    Form
){
    "use strict";

    QUnit.module('Dropdown Tests');

    var html =
        '<select>' +
            '<option value="AAPL">Apple</option>' +
            '<option value="FB">Facebook</option>' +
            '<option value="GOOG">Google</option>' +
        '</select>';

    QUnit.test('setting and getting dropdown values', function() {
        QUnit.expect(7);
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var options = selectEl.getElementsByTagName('option');
        options[1].selected = true; // make second item selected initially
        var onChangeSpy = Sinon.spy();
        var dropdown = new Form.Dropdown({el: selectEl, onChange: onChangeSpy});
        QUnit.equal(dropdown.getValue(), options[1].value, 'calling getValue() returns second item\'s value since it is was designated as selected initially');
        QUnit.equal(dropdown.getDisplayValue(), options[1].textContent, 'calling getDisplayValue() returns second item\'s display value');
        QUnit.equal(onChangeSpy.callCount, 0, 'onChange callback was NOT fired because value hasnt been changed yet');
        // set to third value
        var selectChangeSpy = Sinon.spy();
        selectEl.onchange = selectChangeSpy;
        dropdown.setValue('GOOG');
        QUnit.equal(dropdown.getValue(), options[2].value, 'calling getValue() after setting the value to third item returns third item\'s value since it is was designated as selected initially');
        QUnit.equal(dropdown.getDisplayValue(), options[2].textContent, 'calling getDisplayValue() returns third item\'s display value');
        QUnit.equal(selectChangeSpy.callCount, 1, 'selects native change event was fired');
        QUnit.deepEqual(onChangeSpy.args[0], [selectEl, selectEl, selectChangeSpy.args[0][0]], 'onChange callback was fired with third items args');
        dropdown.destroy();
    });

});