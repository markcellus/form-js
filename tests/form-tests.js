"use strict";
var Sinon = require('sinon');
var QUnit = require('qunit');
var TestUtils = require('test-utils');
var ElementKit = require('element-kit');
var Form = require('../src/form');

module.exports = (function () {

    QUnit.module('Form Tests');

    var formHtml = ' ' +
        '<form>' +
            '<input type="text" name="test_input_field" value="text1" />' +
            '<div>' +
                '<input type="checkbox" name="test_toggle1" value="toggle1" />' +
                '<input type="checkbox" name="test_toggle2" value="toggle2" />' +
            '</div>' +
            '<input type="email" name="test_input_email" value="hey@test.com" />' +
            '<input type="checkbox" name="chk_group" value="value1" />Value 1<br />' +
            '<input type="checkbox" name="chk_group" value="value2" />Value 2<br />' +
            '<input type="submit" class="submit-button" value="Submit" />' +
        '</form>';

    QUnit.module('Form Tests');

    QUnit.test('change events', function () {
        QUnit.expect(4);
        var fixture = document.getElementById('qunit-fixture');
        var el = TestUtils.createHtmlElement(formHtml);
        fixture.appendChild(el);
        var onChangeSpy = Sinon.spy();
        var instance = new Form({el: el, onValueChange: onChangeSpy});
        var inputEl = el.querySelectorAll('input[type="text"]')[0];
        QUnit.equal(onChangeSpy.callCount, 0, 'onChange callback was NOT yet fired because no change event was triggered');
        var changeEvent = document.createEvent('CustomEvent');
        changeEvent.initCustomEvent('change', false, false, null);
        inputEl.dispatchEvent(changeEvent);
        var eventObj = onChangeSpy.args[0][0];
        QUnit.equal(eventObj.type, 'change', 'after change event was triggered, onValueChange callback was fired with event object that has correct "type"');
        QUnit.equal(eventObj.target, inputEl, 'onValueChange callback was fired with event object that has correct "target"');
        // setup destroy
        el.dispatchEvent(TestUtils.createEvent('change'));
        instance.destroy();
        inputEl.dispatchEvent(changeEvent);
        QUnit.equal(onChangeSpy.callCount, 1, 'on destroy, changes on input field no longer trigger onValueChange');
    });

    QUnit.test('getting current values', function () {
        QUnit.expect(3);
        var fixture = document.getElementById('qunit-fixture');
        var el = TestUtils.createHtmlElement(formHtml);
        fixture.appendChild(el);
        var instance = new Form({el: el});
        var textInputs = el.querySelectorAll('[type="text"]');
        var assertedValues = [
            {name: 'test_input_field', value: 'text1'},
            {name: 'test_toggle1', value: 'toggle1'},
            {name: 'test_toggle2', value: 'toggle2'},
            {name: 'test_input_email', value: 'hey@test.com'},
            {name: 'chk_group', value: 'value1'},
            {name: 'chk_group', value: 'value2'}
        ];
        var textInput = textInputs[0];
        QUnit.deepEqual(instance.getCurrentValues(), assertedValues, 'after setting up, getCurrentValues() returns correct object map of values');
        var newInputValue = 'newval';
        textInput.value = newInputValue; // change inputs value
        assertedValues = [
            {name: 'test_input_field', value: newInputValue},
            {name: 'test_toggle1', value: 'toggle1'},
            {name: 'test_toggle2', value: 'toggle2'},
            {name: 'test_input_email', value: 'hey@test.com'},
            {name: 'chk_group', value: 'value1'},
            {name: 'chk_group', value: 'value2'}
        ];
        QUnit.deepEqual(instance.getCurrentValues(), assertedValues, 'after changing the input values, getCurrentValues() returns correct object map of values');
        var newInputFieldValue = 'pht';
        var newInputFieldName = 'phantom_val';
        var newInputField = TestUtils.createHtmlElement('<input type="text" class="form-field-text" name="' + newInputFieldName + '" value="' + newInputFieldValue + '" />');
        el.appendChild(newInputField); // attach new input field to form with new value
        assertedValues = [
            {name: 'test_input_field', value: newInputValue},
            {name: 'test_toggle1', value: 'toggle1'},
            {name: 'test_toggle2', value: 'toggle2'},
            {name: 'test_input_email', value: 'hey@test.com'},
            {name: 'chk_group', value: 'value1'},
            {name: 'chk_group', value: 'value2'},
            {name: 'phantom_val', value: 'pht'}
        ];
        QUnit.deepEqual(instance.getCurrentValues(), assertedValues, 'after appending a new input field to the form, getCurrentValues() returns correct object map of values');
        instance.destroy();
    });

})();