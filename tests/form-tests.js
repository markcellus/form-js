"use strict";
var Sinon = require('sinon');
var QUnit = require('qunit');
var TestUtils = require('test-utils');
var Form = require('../src/form');
var Dropdown = require('../src/dropdown');
var InputField = require('../src/input-field');
var Checkbox = require('../src/checkbox');
var ButtonToggle = require('../src/button-toggle');
var SubmitButton = require('../src/submit-button');
var Module = require('module.js');

module.exports = (function () {

    QUnit.module('Form Tests');

    QUnit.test('getCurrentValues() returns correct array objects on initialize', function () {
        QUnit.expect(6);
        var fixture = document.getElementById('qunit-fixture');
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
        var el = TestUtils.createHtmlElement(formHtml);
        fixture.appendChild(el);
        var instance = new Form({el: el});
        var inputs = el.querySelectorAll('[name]');
        var values = instance.getCurrentValues();
        var assertedValue = {name: 'test_input_field', value: 'text1', required: inputs[0].required, disabled: inputs[0].disabled, formElement: inputs[0]};
        QUnit.deepEqual(values[0], assertedValue, 'object 1 was correct');
        assertedValue = {name: 'test_toggle1', value: 'toggle1', required: inputs[1].required, disabled: inputs[1].disabled, formElement: inputs[1]};
        QUnit.deepEqual(values[1], assertedValue, 'object 2 was correct');
        assertedValue = {name: 'test_toggle2', value: 'toggle2', required: inputs[2].required, disabled: inputs[2].disabled, formElement: inputs[2]};
        QUnit.deepEqual(values[2], assertedValue, 'object 3 was correct');
        assertedValue = {name: 'test_input_email', value: 'hey@test.com', required: inputs[3].required, disabled: inputs[3].disabled, formElement: inputs[3]};
        QUnit.deepEqual(values[3], assertedValue, 'object 4 was correct');
        assertedValue = {name: 'chk_group', value: 'value1', required: inputs[4].required, disabled: inputs[4].disabled, formElement: inputs[4]};
        QUnit.deepEqual(values[4], assertedValue, 'object 5 was correct');
        assertedValue = {name: 'chk_group', value: 'value2', required: inputs[5].required, disabled: inputs[5].disabled, formElement: inputs[5]};
        QUnit.deepEqual(values[5], assertedValue, 'object 6 was correct');
        instance.destroy();
    });

    QUnit.test('getCurrentValues() returns new object after changing its associated value', function () {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var formHtml = ' ' +
            '<form>' +
                '<input type="text" name="test_input_field" value="text1" />' +
            '</form>';
        var el = TestUtils.createHtmlElement(formHtml);
        fixture.appendChild(el);
        var instance = new Form({el: el});
        var inputText = el.getElementsByTagName('input')[0];
        var newInputValue = 't2';
        inputText.value = newInputValue; // change inputs value
        QUnit.deepEqual(instance.getCurrentValues()[0].value, newInputValue, 'object was returned with new value');
        instance.destroy();
    });

    QUnit.test('getCurrentValues() returns updated object after appending a new input field to the DOM inside of the form', function () {
        QUnit.expect(2);
        var fixture = document.getElementById('qunit-fixture');
        var formHtml = ' ' +
            '<form>' +
                '<input type="text" name="test_input_field" value="text1" />' +
            '</form>';
        var el = TestUtils.createHtmlElement(formHtml);
        fixture.appendChild(el);
        var instance = new Form({el: el});
        var newInputFieldValue = 'pht';
        var newInputFieldName = 'phantom_val';
        var newInputField = TestUtils.createHtmlElement('<input type="text" class="form-field-text" name="' + newInputFieldName + '" value="' + newInputFieldValue + '" />');
        el.appendChild(newInputField); // attach new input field to form with new value
        var testValueObj = instance.getCurrentValues()[1];
        QUnit.deepEqual(testValueObj.value, newInputFieldValue, 'object was returned with new value');
        QUnit.deepEqual(testValueObj.name, newInputFieldName, 'object was returned with new name attribute');
        instance.destroy();
    });

    QUnit.test('should call initialize method of Module super class when instantiated', function () {
        QUnit.expect(1);
        var formEl = TestUtils.createHtmlElement('<form></form>');
        var formOptions = {el: formEl};
        var moduleInitializeStub = Sinon.stub(Module.prototype, 'initialize');
        var formInstance = new Form(formOptions);
        QUnit.deepEqual(moduleInitializeStub.args[0][0], formOptions, 'initialized with form options');
        formInstance.destroy();
        moduleInitializeStub.restore();
    });

    QUnit.test('Dropdown class should be instantiated with correct select element and get destroyed correctly', function () {
        QUnit.expect(3);
        var dropdownClass = 'form-dropdown-select';
        var formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
                '<select name="select" class="' + dropdownClass + '" id="age-gate-form-country-label-id">' +
                    '<option class="form-dropdown-option">North America</option>' +
                '</select>' +
            '</form>');

        var selectEl = formEl.getElementsByTagName('select')[0];
        var dropdownInitialize = Sinon.stub(Dropdown.prototype, 'initialize');
        var dropdownDestroy = Sinon.stub(Dropdown.prototype, 'destroy');
        var formInstance = new Form({el: formEl, dropdownClass: dropdownClass});
        QUnit.equal(dropdownInitialize.callCount, 0, 'Dropdown class was not yet initialized because setup() wasnt triggered yet');
        formInstance.setup();
        QUnit.deepEqual(dropdownInitialize.args[0][0].el, selectEl, 'after setting up, Dropdown class was instantiated with correct options');
        formInstance.destroy();
        QUnit.equal(dropdownDestroy.callCount, 1, 'after destroy() is called, Dropdown class instance was destroyed');
        dropdownDestroy.restore();
        dropdownInitialize.restore();
    });

    QUnit.test('InputField class should be instantiated with correct input element and get destroyed correctly', function () {
        QUnit.expect(3);
        var inputClass = 'text-field';
        var formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
                '<input type="text" name="test_input_field" class="' + inputClass + '" value="text1" />' +
            '</form>'
        );
        var inputEl = formEl.getElementsByTagName('input')[0];
        var inputFieldInitialize = Sinon.stub(InputField.prototype, 'initialize');
        var inputFieldDestroy = Sinon.stub(InputField.prototype, 'destroy');
        var formInstance = new Form({el: formEl, inputFieldClass: inputClass});
        QUnit.equal(inputFieldInitialize.callCount, 0, 'InputField class was not yet initialized because setup() wasnt triggered yet');
        formInstance.setup();
        QUnit.deepEqual(inputFieldInitialize.args[0][0].el, inputEl, 'after setting up, InputField class was instantiated with correct options');
        formInstance.destroy();
        QUnit.equal(inputFieldDestroy.callCount, 1, 'after destroy() is called, InputField class instance was destroyed');
        inputFieldDestroy.restore();
        inputFieldInitialize.restore();
    });

    QUnit.test('Checkbox class should be instantiated with checkbox elements and get destroyed correctly', function () {
        QUnit.expect(3);
        var checkboxClass = 'checkbox';
        var formEl = TestUtils.createHtmlElement(' ' +
        '<form>' +
            '<input type="checkbox" name="test_toggle" class="' + checkboxClass + '" value="toggle1" />' +
            '<input type="checkbox" name="test_toggle" class="' + checkboxClass + '" value="toggle2" />' +
        '</form>');
        var checkboxEls = formEl.getElementsByClassName('checkbox');
        var checkboxInitializeStub = Sinon.stub(Checkbox.prototype, 'initialize');
        var checkboxDestroyStub = Sinon.stub(Checkbox.prototype, 'destroy');

        var formInstance = new Form({el: formEl, checkboxClass: checkboxClass});
        formInstance.setup();
        QUnit.equal(checkboxInitializeStub.args[0][0].el, checkboxEls[0], 'after setting up, first Checkbox class was instantiated with first checkbox element');
        QUnit.equal(checkboxInitializeStub.args[1][0].el, checkboxEls[1], 'second Checkbox class was instantiated with second checkbox element');
        formInstance.destroy();
        QUnit.equal(checkboxDestroyStub.callCount, 2, 'both Checkbox instances were destroyed');
        checkboxDestroyStub.restore();
        checkboxInitializeStub.restore();
    });

    QUnit.test('ButtonToggle class should be instantiated with radio button elements with the same name attribute and get destroyed correctly', function () {
        QUnit.expect(4);
        var radioClass = 'radio';
        var formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
                '<input type="radio" name="test" class="' + radioClass + '" value="radioA" />' +
                '<input type="radio" name="test" class="' + radioClass + '" value="radioB" />' +
            '</form>');
        var radioEls = formEl.getElementsByClassName(radioClass);
        var buttonToggleInitializeStub = Sinon.stub(ButtonToggle.prototype, 'initialize');
        var buttonToggleDestroyStub = Sinon.stub(ButtonToggle.prototype, 'destroy');

        var formInstance = new Form({el: formEl, buttonToggleClass: radioClass});
        formInstance.setup();
        QUnit.equal(buttonToggleInitializeStub.args[0][0].inputs[0], radioEls[0], 'after setting up, ButtonToggle class was instantiated with first radio element');
        QUnit.equal(buttonToggleInitializeStub.args[0][0].inputs[1], radioEls[1], 'ButtonToggle class was instantiated with second radio element');
        QUnit.equal(buttonToggleInitializeStub.callCount, 1, 'ButtonToggle class was only instantiated once');
        formInstance.destroy();
        QUnit.equal(buttonToggleDestroyStub.callCount, 1, 'ButtonToggle instance was destroyed');
        buttonToggleDestroyStub.restore();
        buttonToggleInitializeStub.restore();
    });

    QUnit.test('SubmitButton class should NOT be instantiated if there is no element that matches the passed class', function () {
        QUnit.expect(1);
        var btnClass = 'submity';
        var formEl = TestUtils.createHtmlElement('<form></form>');
        var submitButtonInitialize = Sinon.stub(SubmitButton.prototype, 'initialize');
        var submitButtonDestroy = Sinon.stub(SubmitButton.prototype, 'destroy');
        var formInstance = new Form({el: formEl, submitButtonClass: btnClass});
        formInstance.setup();
        QUnit.equal(submitButtonInitialize.callCount, 0, 'SubmitButton class was NOT instantiated');
        formInstance.destroy();
        submitButtonDestroy.restore();
        submitButtonInitialize.restore();
    });

    QUnit.test('SubmitButton class should be instantiated and destroyed correctly if there is an element that matches the passed class', function () {
        QUnit.expect(2);
        var btnClass = 'submity';
        var formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
            '<button type="submit" name="test" class="' + btnClass + '" /></button>' +
            '</form>');
        var buttonEl = formEl.getElementsByClassName(btnClass)[0];
        var submitButtonInitialize = Sinon.stub(SubmitButton.prototype, 'initialize');
        var submitButtonDestroy = Sinon.stub(SubmitButton.prototype, 'destroy');
        var formInstance = new Form({el: formEl, submitButtonClass: btnClass});
        formInstance.setup();
        QUnit.equal(submitButtonInitialize.args[0][0].el, buttonEl, 'after setting up, SubmitButton class was instantiated with correct element');
        formInstance.destroy();
        QUnit.equal(submitButtonDestroy.callCount, 1, 'SubmitButton instance was destroyed');
        submitButtonDestroy.restore();
        submitButtonInitialize.restore();
    });


    QUnit.test('multiple ButtonToggle classes should be instantiated with radio button elements with different name attributes and they should be destroyed correctly', function () {
        QUnit.expect(3);
        var radioClass = 'radio';
        var formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
                '<input type="radio" name="test" class="' + radioClass + '" value="radioA" />' +
                '<input type="radio" name="test2" class="' + radioClass + '" value="radioB" />' +
            '</form>');
        var radioEls = formEl.getElementsByClassName(radioClass);
        var buttonToggleInitializeStub = Sinon.stub(ButtonToggle.prototype, 'initialize');
        var buttonToggleDestroyStub = Sinon.stub(ButtonToggle.prototype, 'destroy');

        var formInstance = new Form({el: formEl, buttonToggleClass: radioClass});
        formInstance.setup();
        QUnit.equal(buttonToggleInitializeStub.args[0][0].inputs[0], radioEls[0], 'after setting up, ButtonToggle class was instantiated with first radio element');
        QUnit.equal(buttonToggleInitializeStub.args[1][0].inputs[0], radioEls[1], 'ButtonToggle class was instantiated again with second radio element');
        formInstance.destroy();
        QUnit.equal(buttonToggleDestroyStub.callCount, 2, 'all ButtonToggle instances were destroyed');
        buttonToggleDestroyStub.restore();
        buttonToggleInitializeStub.restore();
    });

    QUnit.test('getInstanceByName()', function () {
        QUnit.expect(1);
        var formElementClass = 'form-toggle-input1';
        var formNameValue = 'test_toggle1';
        var formEl = TestUtils.createHtmlElement('<form><input type="text" name="' + formNameValue + '" class="' + formElementClass + '" /></form>');
        var instance = new Form({el: formEl, inputFieldClass: formElementClass});
        var inputEl = formEl.getElementsByClassName(formElementClass)[0];
        instance.setup();
        QUnit.deepEqual(instance.getInstanceByName(formNameValue).getFormElement(), inputEl, 'querying getInstanceByName() returns correct instance');
        instance.destroy();
    });

})();