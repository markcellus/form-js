"use strict";
let Sinon = require('sinon');
let QUnit = require('qunit');
let TestUtils = require('test-utils');
let Form = require('../src/form');
let Dropdown = require('../src/dropdown');
let InputField = require('../src/input-field');
let Checkbox = require('../src/checkbox');
let TextArea = require('../src/text-area');
let Radios = require('../src/radios');
let SubmitButton = require('../src/submit-button');

module.exports = (function () {

    QUnit.module('Form');

    QUnit.test('getCurrentValues() returns correct array objects on initialize', function () {
        QUnit.expect(6);
        let fixture = document.getElementById('qunit-fixture');
        let formHtml = ' ' +
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
        let el = TestUtils.createHtmlElement(formHtml);
        fixture.appendChild(el);
        let instance = new Form({el: el});
        let inputs = el.querySelectorAll('[name]');
        let values = instance.getCurrentValues();
        let assertedValue = {name: 'test_input_field', value: 'text1', required: inputs[0].required, disabled: inputs[0].disabled, formElement: inputs[0]};
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
        let fixture = document.getElementById('qunit-fixture');
        let formHtml = ' ' +
            '<form>' +
                '<input type="text" name="test_input_field" value="text1" />' +
            '</form>';
        let el = TestUtils.createHtmlElement(formHtml);
        fixture.appendChild(el);
        let instance = new Form({el: el});
        let inputText = el.getElementsByTagName('input')[0];
        let newInputValue = 't2';
        inputText.value = newInputValue; // change inputs value
        QUnit.deepEqual(instance.getCurrentValues()[0].value, newInputValue, 'object was returned with new value');
        instance.destroy();
    });

    QUnit.test('getCurrentValues() returns updated object after appending a new input field to the DOM inside of the form', function () {
        QUnit.expect(2);
        let fixture = document.getElementById('qunit-fixture');
        let formHtml = ' ' +
            '<form>' +
                '<input type="text" name="test_input_field" value="text1" />' +
            '</form>';
        let el = TestUtils.createHtmlElement(formHtml);
        fixture.appendChild(el);
        let instance = new Form({el: el});
        let newInputFieldValue = 'pht';
        let newInputFieldName = 'phantom_val';
        let newInputField = TestUtils.createHtmlElement('<input type="text" class="form-field-text" name="' + newInputFieldName + '" value="' + newInputFieldValue + '" />');
        el.appendChild(newInputField); // attach new input field to form with new value
        let testValueObj = instance.getCurrentValues()[1];
        QUnit.deepEqual(testValueObj.value, newInputFieldValue, 'object was returned with new value');
        QUnit.deepEqual(testValueObj.name, newInputFieldName, 'object was returned with new name attribute');
        instance.destroy();
    });

    QUnit.test('when a select element exists, Dropdown gets instantiated with the select element in its options, and destroys correctly', function () {
        QUnit.expect(3);
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
            '<select name="select" id="age-gate-form-country-label-id">' +
                '<option class="form-dropdown-option">North America</option>' +
            '</select>' +
            '</form>');

        let selectEl = formEl.getElementsByTagName('select')[0];
        let formInstance = new Form({el: formEl});
        QUnit.ok(!formInstance.getInstanceByName('select'), 'Dropdown class was not yet initialized because setup() wasnt triggered yet');
        formInstance.setup();
        let dropdownInstance = formInstance.getInstanceByName('select');
        let dropdownDestroySpy = Sinon.spy(dropdownInstance, 'destroy');
        QUnit.deepEqual(dropdownInstance.options.el, selectEl, 'after setting up, Dropdown class was instantiated with correct options');
        formInstance.destroy();
        QUnit.equal(dropdownDestroySpy.callCount, 1, 'after destroy() is called, Dropdown class instance was destroyed');
    });

    QUnit.test('should instantiate the Dropdown class when dropdownClass option is supplied', function () {
        QUnit.expect(1);
        let dropdownClass = 'form-dropdown-select';
        let dropdownName = 'select_dropdown';
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
            '<select name="' + dropdownName + '" class="' + dropdownClass + '" id="age-gate-form-country-label-id">' +
            '<option class="form-dropdown-option">North America</option>' +
            '</select>' +
            '</form>');

        let selectEl = formEl.getElementsByTagName('select')[0];
        let formInstance = new Form({el: formEl, dropdownClass: dropdownClass});
        formInstance.setup();
        let dropdownInstance = formInstance.getInstanceByName(dropdownName);
        QUnit.deepEqual(dropdownInstance.options.el, selectEl, 'after setting up, Dropdown class was instantiated with correct element');
        formInstance.destroy();
    });

    QUnit.test('when an text input element exists, InputField gets instantiated with the input element in its options, and destroys correctly', function () {
        QUnit.expect(3);
        let inputFieldName = 'test_input_field';
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
                '<input type="text" name="' + inputFieldName + '" value="text1" />' +
            '</form>'
        );
        let inputEl = formEl.getElementsByTagName('input')[0];
        let formInstance = new Form({el: formEl});
        QUnit.ok(!formInstance.getInstanceByName(inputFieldName), 'InputField class was not yet instantiated because setup() wasnt triggered yet');
        formInstance.setup();
        let inputFieldInstance = formInstance.getInstanceByName(inputFieldName);
        QUnit.deepEqual(inputFieldInstance.options.el, inputEl, 'after setting up, InputField class was instantiated with correct options');
        Sinon.spy(inputFieldInstance, 'destroy');
        formInstance.destroy();
        QUnit.equal(inputFieldInstance.destroy.callCount, 1, 'after destroy() is called, InputField class instance was destroyed');
    });

    QUnit.test('specifying a css class for input fields in constructor options should instantiate and destroy InputField class correctly', function () {
        QUnit.expect(1);
        let inputClass = 'text-field';
        let inputFieldName = 'test_input_field';
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
            '<input type="text" name="' + inputFieldName + '" class="' + inputClass + '" value="text1" />' +
            '</form>'
        );
        let inputEl = formEl.getElementsByTagName('input')[0];
        let formInstance = new Form({el: formEl, inputFieldClass: inputClass});
        formInstance.setup();
        let inputFieldInstance = formInstance.getInstanceByName(inputFieldName);
        QUnit.deepEqual(inputFieldInstance.options.el, inputEl, 'after setting up, InputField class was instantiated with correct options');
        formInstance.destroy();
    });


    QUnit.test('when an input checkbox element exists, Checkbox gets instantiated with the checkbox element in its options, and destroys correctly', function () {
        QUnit.expect(6);
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
                '<input type="checkbox" name="test_toggle1" value="toggle1" />' +
                '<input type="checkbox" name="test_toggle2" value="toggle2" />' +
            '</form>');
        let checkboxEls = formEl.getElementsByTagName('input');
        let formInstance = new Form({el: formEl});
        QUnit.ok(!formInstance.getInstanceByName('test_toggle1'));
        QUnit.ok(!formInstance.getInstanceByName('test_toggle2'));
        formInstance.setup();
        let firstCheckboxInstance = formInstance.getInstanceByName('test_toggle1');
        let secondCheckboxInstance = formInstance.getInstanceByName('test_toggle2');
        Sinon.spy(firstCheckboxInstance, 'destroy');
        Sinon.spy(secondCheckboxInstance, 'destroy');
        QUnit.equal(firstCheckboxInstance.options.el, checkboxEls[0], 'after setting up, first Checkbox class was instantiated with first checkbox element');
        QUnit.equal(secondCheckboxInstance.options.el, checkboxEls[1], 'second Checkbox class was instantiated with second checkbox element');
        formInstance.destroy();
        QUnit.equal(firstCheckboxInstance.destroy.callCount, 1, 'first Checkbox instance was destroyed');
        QUnit.equal(secondCheckboxInstance.destroy.callCount, 1, 'second Checkbox instance was destroyed');
    });

    QUnit.test('should instantiate the Checkbox class when checkboxClass option is supplied', function () {
        QUnit.expect(2);
        let checkboxClass = 'checkbox';
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
            '<input type="checkbox" name="test_toggle1" class="' + checkboxClass + '" value="toggle1" />' +
            '<input type="checkbox" name="test_toggle2" class="' + checkboxClass + '" value="toggle2" />' +
            '</form>');
        let checkboxEls = formEl.getElementsByClassName('checkbox');
        let formInstance = new Form({el: formEl, checkboxClass: checkboxClass});
        formInstance.setup();
        let firstCheckboxInstance = formInstance.getInstanceByName('test_toggle1');
        let secondCheckboxInstance = formInstance.getInstanceByName('test_toggle2');
        QUnit.equal(firstCheckboxInstance.options.el, checkboxEls[0], 'after setting up, first Checkbox class was instantiated with first checkbox element');
        QUnit.equal(secondCheckboxInstance.options.el, checkboxEls[1], 'second Checkbox class was instantiated with second checkbox element');
        formInstance.destroy();
    });

    QUnit.test('when multiple radio inputs exist with the same name attribute, only one Radios instance should be created, and destroyed correctly', function () {
        QUnit.expect(4);
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
                '<input type="radio" name="test" value="radioA" />' +
                '<input type="radio" name="test" value="radioB" />' +
            '</form>');
        let radioEls = formEl.getElementsByTagName('input');
        let formInstance = new Form({el: formEl});
        QUnit.ok(!formInstance.getInstanceByName('test'));
        formInstance.setup();
        let radioButtonInstance = formInstance.getInstanceByName('test');
        QUnit.equal(radioButtonInstance.options.inputs[0], radioEls[0], 'after setting up, Radios class was instantiated with first radio element');
        QUnit.equal(radioButtonInstance.options.inputs[1], radioEls[1], 'Radios class was instantiated with second radio element');
        Sinon.spy(radioButtonInstance, 'destroy');
        formInstance.destroy();
        QUnit.equal(radioButtonInstance.destroy.callCount, 1, 'Radios instance was destroyed');
    });

    QUnit.test('should instantiate the Radios class when buttonToggleClass option is supplied', function () {
        QUnit.expect(2);
        let radioClass = 'radio';
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
            '<input type="radio" name="test" class="' + radioClass + '" value="radioA" />' +
            '<input type="radio" name="test" class="' + radioClass + '" value="radioB" />' +
            '</form>');
        let radioEls = formEl.getElementsByClassName(radioClass);
        let formInstance = new Form({el: formEl, buttonToggleClass: radioClass});
        formInstance.setup();
        let radioButtonInstance = formInstance.getInstanceByName('test');
        QUnit.equal(radioButtonInstance.options.inputs[0], radioEls[0], 'after setting up, Radios class was instantiated with first radio element');
        QUnit.equal(radioButtonInstance.options.inputs[1], radioEls[1], 'Radios class was instantiated with second radio element');
        formInstance.destroy();
    });

    QUnit.test('radio buttons with different name attributes should instantiate and destroy Radios class correctly', function () {
        QUnit.expect(6);
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
            '<input type="radio" name="test" value="radioA" />' +
            '<input type="radio" name="test2" value="radioB" />' +
            '</form>');
        let radioEls = formEl.getElementsByTagName('input');
        let formInstance = new Form({el: formEl});
        QUnit.ok(!formInstance.getInstanceByName('test'));
        QUnit.ok(!formInstance.getInstanceByName('test2'));
        formInstance.setup();
        let firstRadiosInstance = formInstance.getInstanceByName('test');
        let secondRadiosInstance = formInstance.getInstanceByName('test2');
        QUnit.equal(firstRadiosInstance.options.inputs[0], radioEls[0], 'after setting up, Radios class was instantiated with first radio element');
        QUnit.equal(secondRadiosInstance.options.inputs[0], radioEls[1], 'Radios class was instantiated again with second radio element');
        Sinon.spy(firstRadiosInstance, 'destroy');
        Sinon.spy(secondRadiosInstance, 'destroy');
        formInstance.destroy();
        QUnit.equal(firstRadiosInstance.destroy.callCount, 1, 'first radio instance was destroyed');
        QUnit.equal(secondRadiosInstance.destroy.callCount, 1, 'second radio instance was destroyed');
    });

    QUnit.test('should instantiate multiple Radios class instances when buttonToggleClass option is supplied', function () {
        QUnit.expect(2);
        let radioClass = 'radio';
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
                '<input type="radio" name="test" class="' + radioClass + '" value="radioA" />' +
                '<input type="radio" name="test2" class="' + radioClass + '" value="radioB" />' +
            '</form>');
        let radioEls = formEl.getElementsByClassName(radioClass);
        let formInstance = new Form({el: formEl, buttonToggleClass: radioClass});
        formInstance.setup();
        let firstRadiosInstance = formInstance.getInstanceByName('test');
        let secondRadiosInstance = formInstance.getInstanceByName('test2');
        QUnit.equal(firstRadiosInstance.options.inputs[0], radioEls[0], 'after setting up, Radios class was instantiated with first radio element');
        QUnit.equal(secondRadiosInstance.options.inputs[0], radioEls[1], 'Radios class was instantiated again with second radio element');
        formInstance.destroy();
    });

    QUnit.test('SubmitButton class should NOT be instantiated if there is no element that matches the passed class', function () {
        QUnit.expect(1);
        let btnClass = 'submity';
        let formEl = TestUtils.createHtmlElement('<form></form>');
        let formInstance = new Form({el: formEl, submitButtonClass: btnClass});
        formInstance.setup();
        QUnit.ok(!formInstance.getSubmitButtonInstance(), 'SubmitButton class was NOT instantiated');
        formInstance.destroy();
    });

    QUnit.test('SubmitButton class should be instantiated and destroyed correctly if there is an element that matches the passed class', function () {
        QUnit.expect(3);
        let btnClass = 'submity';
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
            '<button type="submit" name="test" class="' + btnClass + '" /></button>' +
            '</form>');
        let buttonEl = formEl.getElementsByClassName(btnClass)[0];
        let formInstance = new Form({el: formEl, submitButtonClass: btnClass});
        QUnit.ok(!formInstance.getSubmitButtonInstance());
        formInstance.setup();
        let submitButtonInstance = formInstance.getSubmitButtonInstance();
        QUnit.equal(submitButtonInstance.options.el, buttonEl, 'after setting up, SubmitButton class was instantiated with correct element');
        Sinon.spy(submitButtonInstance, 'destroy');
        formInstance.destroy();
        QUnit.equal(submitButtonInstance.destroy.callCount, 1, 'SubmitButton instance was destroyed');
    });

    QUnit.test('getInstanceByName()', function () {
        QUnit.expect(1);
        let formElementClass = 'form-toggle-input1';
        let formNameValue = 'test_toggle1';
        let formEl = TestUtils.createHtmlElement('<form><input type="text" name="' + formNameValue + '" class="' + formElementClass + '" /></form>');
        let instance = new Form({el: formEl, inputFieldClass: formElementClass});
        let inputEl = formEl.getElementsByClassName(formElementClass)[0];
        instance.setup();
        QUnit.deepEqual(instance.getInstanceByName(formNameValue).getFormElement(), inputEl, 'querying getInstanceByName() returns correct instance');
        instance.destroy();
    });

    QUnit.asyncTest('should update the input field value to any value that is assigned to a key in the data options object that matches the input field\'s name attribute', function () {
        QUnit.expect(2);
        let formNameValue = 'test_toggle1';
        let formEl = TestUtils.createHtmlElement('<form><input type="text" name="' + formNameValue + '" /></form>');
        let data = {};
        let pollTime = 25;
        let instance = new Form({
            el: formEl,
            data: data,
            legacyDataPollTime: pollTime //phantomjs needs legacy data dirty checking
        });
        let inputEl = formEl.getElementsByTagName('input')[0];
        instance.setup();
        QUnit.ok(!inputEl.value, 'input field originally has no value');
        let newVal = 'myNewInputValue';
        // change data value
        data[formNameValue] = newVal;
        // data changing is asynchronous so must wait for new data to register
        setTimeout(function () {
            QUnit.equal(inputEl.value, newVal);
            instance.destroy();
            QUnit.start();
        }, pollTime + 5);
    });

    QUnit.test('passing a data object with a key that matches the input field name attribute should setup the input field with that value', function () {
        QUnit.expect(1);
        let formNameValue = 'test_toggle1';
        let formEl = TestUtils.createHtmlElement('<form><input type="text" name="' + formNameValue + '" /></form>');
        let data = {};
        let initialValue = 'myValue';
        data[formNameValue] = initialValue;
        let instance = new Form({el: formEl, data: data});
        let inputEl = formEl.getElementsByTagName('input')[0];
        instance.setup();
        QUnit.equal(inputEl.value, initialValue);
        instance.destroy();
    });

    QUnit.test('changing input field value should update the data options object key that matches the input field\'s name attribute', function () {
        QUnit.expect(2);
        let formNameValue = 'test_toggle_data';
        let formEl = TestUtils.createHtmlElement('<form><input type="text" name="' + formNameValue + '" /></form>');
        let data = {};
        // set a key to let form class know we want
        // this data object to be updated
        data[formNameValue] = null;
        let instance = new Form({el: formEl, data: data});
        let inputEl = formEl.getElementsByTagName('input')[0];
        instance.setup();
        QUnit.ok(!data[formNameValue], 'data object key originally has no value');
        let newVal = 'myNewInputValue';
        // change input value
        inputEl.value = newVal;
        // dispatch change event to trigger the change
        let changeEvent = document.createEvent('Event');
        changeEvent.initEvent('change', true, false);
        inputEl.dispatchEvent(changeEvent);
        QUnit.equal(data[formNameValue], newVal, 'data object key value has been updated');
        instance.destroy();
    });

    QUnit.test('changing input field value should call the function assigned to the key in the data options object that matches the input field\'s name attribute', function () {
        QUnit.expect(2);
        let formNameValue = 'test_toggle_data';
        let formEl = TestUtils.createHtmlElement('<form><input type="text" name="' + formNameValue + '" /></form>');
        let data = {};
        data[formNameValue] = Sinon.spy();
        let instance = new Form({el: formEl, data: data});
        let inputEl = formEl.getElementsByTagName('input')[0];
        instance.setup();
        QUnit.equal(inputEl.value, '', 'input field originally has no value');
        let newVal = 'myNewInputValue';
        // change input value
        inputEl.value = newVal;
        // dispatch change event to trigger the change
        let changeEvent = document.createEvent('Event');
        changeEvent.initEvent('change', true, false);
        inputEl.dispatchEvent(changeEvent);
        QUnit.deepEqual(data[formNameValue].args[0], [newVal], 'data object key function was called with new value');
        instance.destroy();
    });

    QUnit.test('passing a data object with a key with a boolean value that matches the checkbox name attribute should setup the checkbox with that value as true', function () {
        QUnit.expect(1);
        let formNameValue = 'chk_group';
        let formEl = TestUtils.createHtmlElement('<form><input type="checkbox" name="' + formNameValue + '" /></form>');
        let data = {};
        let initialValue = true;
        data[formNameValue] = initialValue;
        let instance = new Form({el: formEl, data: data});
        let checkboxEl = formEl.getElementsByTagName('input')[0];
        instance.setup();
        QUnit.equal(checkboxEl.checked, initialValue);
        instance.destroy();
    });

    QUnit.test('passing a data object with a key that has a value that matches the radio name attribute should select the correct radio input', function () {
        QUnit.expect(2);
        let formNameValue = 'gender';
        let initialValue = 'girl';
        let formEl = TestUtils.createHtmlElement('<form>' +
                '<input type="radio" name="' + formNameValue + '" value="' + initialValue + '" />' +
                '<input type="radio" name="' + formNameValue + '" value="boy"/>' +
            '</form>');
        let data = {};
        data[formNameValue] = initialValue;
        let instance = new Form({el: formEl, data: data});
        let girlRadioEl = formEl.querySelector('input[value="' + initialValue + '"]');
        let boyRadioEl = formEl.querySelector('input[value="boy"]');
        instance.setup();
        QUnit.ok(girlRadioEl.checked);
        QUnit.ok(!boyRadioEl.checked);
        instance.destroy();
    });

    QUnit.test('when a textarea element exists, TextArea gets instantiated with the element as its el option, and destroys correctly', function () {
        QUnit.expect(3);
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
                '<textarea name="select"></textarea>' +
            '</form>');
        let textAreaEl = formEl.getElementsByTagName('textarea')[0];
        let formInstance = new Form({el: formEl});
        QUnit.ok(!formInstance.getInstanceByName('select'), 'TextArea class was not yet initialized because setup() wasnt triggered yet');
        formInstance.setup();
        let textAreaInstance = formInstance.getInstanceByName('select');
        QUnit.deepEqual(textAreaInstance.options.el, textAreaEl, 'after setting up, TextArea class was instantiated with correct options');
        Sinon.spy(textAreaInstance, 'destroy');
        formInstance.destroy();
        QUnit.equal(textAreaInstance.destroy.callCount, 1, 'after destroy() is called, TextArea class instance was destroyed');
    });

    QUnit.test('should instantiate the TextArea class when textAreaClass option is supplied', function () {
        QUnit.expect(1);
        let textAreaClass = 'form-text-area';
        let formEl = TestUtils.createHtmlElement(' ' +
            '<form>' +
            '<textarea name="select" class="' + textAreaClass + '"></textarea>' +
            '</form>');
        let textAreaEl = formEl.getElementsByTagName('textarea')[0];
        let formInstance = new Form({el: formEl, textAreaClass: textAreaClass});
        formInstance.setup();
        let textAreaInstance = formInstance.getInstanceByName('select');
        QUnit.deepEqual(textAreaInstance.options.el, textAreaEl, 'after setting up, TextArea class was instantiated with correct options');
        formInstance.destroy();
    });

    QUnit.test('onValueChange() options callback is fired when input field in form changes', function () {
        QUnit.expect(2);
        let formHtml = ' ' +
            '<form>' +
                '<input type="text" name="test_input_field" value="text1" />' +
            '</form>';
        let formEl = TestUtils.createHtmlElement(formHtml);
        document.getElementById('qunit-fixture').appendChild(formEl);
        let onValueChangeSpy = Sinon.spy();
        let instance = new Form({el: formEl, onValueChange: onValueChangeSpy});
        let inputEl = formEl.getElementsByTagName('input')[0];
        let newInputValue = 'newVal';
        instance.setup();
        // change input value
        inputEl.value = newInputValue;
        // dispatch change event to trigger the change
        let changeEvent = document.createEvent('Event');
        changeEvent.initEvent('change', true, false);
        inputEl.dispatchEvent(changeEvent);
        QUnit.equal(onValueChangeSpy.args[0][0], newInputValue, 'onValueChange callback was fired with value of input as first argument');
        QUnit.deepEqual(onValueChangeSpy.args[0][1], inputEl, 'input element was passed as second argument to onValueChange callback');
        instance.destroy();
    });

    QUnit.test('should trigger onSubmit with appropriate arguments when the form is submitted', function () {
        QUnit.expect(5);
        let inputValue = 'San Fran';
        let inputName = 'location';
        let formEl = document.createElement('form');
        let inputEl = document.createElement('input');
        inputEl.value = inputValue;
        inputEl.name = inputName;
        inputEl.required = true;
        formEl.appendChild(inputEl);
        let onSubmitSpy = Sinon.spy();
        let instance = new Form({el: formEl, onSubmit: onSubmitSpy});
        instance.setup();
        let submitEvent = new Event('submit', {bubbles: false,cancelable: false});
        formEl.dispatchEvent(submitEvent);
        QUnit.deepEqual(onSubmitSpy.args[0][0], submitEvent);
        let submittedInputValue = onSubmitSpy.args[0][1][0];
        QUnit.equal(submittedInputValue.name, inputName);
        QUnit.equal(submittedInputValue.value, inputValue);
        QUnit.equal(submittedInputValue.disabled, false);
        QUnit.equal(submittedInputValue.required, true);
        instance.destroy();
    });

})();
