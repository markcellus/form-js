"use strict";
var Sinon = require('sinon');
var QUnit = require('qunit');
var TestUtils = require('test-utils');
var Form = require('../src/form');
var Dropdown = require('../src/dropdown');
var InputField = require('../src/input-field');
var Checkbox = require('../src/checkbox');
var ButtonToggle = require('../src/button-toggle');
var Module = require('module.js');

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

    //var formHtml = ' ' +
    //    '<form>' +
    //    '<input type="text" name="test_input_field" class="form-field-text" value="text1" />' +
    //    '<div class="form-toggle-group">' +
    //    '<input type="checkbox" name="test_toggle1" class="form-toggle-input1" value="toggle1" />' +
    //    '<input type="checkbox" name="test_toggle2" class="form-toggle-input2" value="toggle2" />' +
    //    '</div>' +
    //    '<input type="date" name="test_input_date" class="form-field-date" value="date1" />' +
    //    '<input type="submit" class="submit-button" value="Submit" />' +
    //    '</form>';

    QUnit.test('getCurrentValues() returns correct array objects on initialize', function () {
        QUnit.expect(6);
        var fixture = document.getElementById('qunit-fixture');
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

    QUnit.test('should instantiate Dropdown with correct el and destroy it correctly', function () {
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

    QUnit.test('should instantiate InputField with correct el and destroy it correctly', function () {
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

    QUnit.test('should instantiate checkbox elements with Checkbox class with correct els and destroys them correctly', function () {
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



    //QUnit.test('setting up and destroying elements', function () {
    //    QUnit.expect(16);
    //    var el = $(formHtml)[0];
    //
    //    // setup stubs
    //    var inputFieldInitializeSpy = Sinon.spy(InputField.prototype, 'initialize');
    //    var inputFieldDestroySpy = Sinon.spy(InputField.prototype, 'destroy');
    //    var buttonToggleInitializeSpy = Sinon.spy(ButtonToggle.prototype, 'initialize');
    //    var buttonToggleDestroySpy = Sinon.spy(ButtonToggle.prototype, 'destroy');
    //    var datePickerInitializeSpy = Sinon.spy(DatePicker.prototype, 'initialize');
    //    var datePickerDestroySpy = Sinon.spy(DatePicker.prototype, 'destroy');
    //
    //    // cache els
    //    var inputField = el.getElementsByClassName('form-field-text')[0];
    //    var toggleContainer = el.getElementsByClassName('form-toggle-group')[0];
    //    var datepickerEl = el.getElementsByClassName('form-field-date')[0];
    //
    //    var formInstance = new Form({el: el});
    //
    //    // test setup
    //    QUnit.equal(inputFieldInitializeSpy.callCount, 0, 'InputField class was not yet initialized because setup() wasnt triggered yet');
    //    QUnit.equal(buttonToggleInitializeSpy.callCount, 0, 'ButtonToggle class was not yet initialized');
    //    QUnit.equal(datePickerInitializeSpy.callCount, 0, 'DatePicker class was not yet initialized');
    //    formInstance.setup();
    //    QUnit.deepEqual(inputFieldInitializeSpy.args[0][0].el, inputField, 'after setting up, InputField class was instantiated with correct options');
    //    QUnit.deepEqual(buttonToggleInitializeSpy.args[0][0].container, toggleContainer, 'ButtonToggle class was instantiated with correct container option');
    //    QUnit.equal(buttonToggleInitializeSpy.args[0][0].inputClass, 'form-toggle-input', 'ButtonToggle class was instantiated with correct inputClass option');
    //    QUnit.equal(buttonToggleInitializeSpy.args[0][0].containerClass, 'form-toggle', 'ButtonToggle class was instantiated with correct containerClass option');
    //    QUnit.equal(buttonToggleInitializeSpy.args[0][0].selectedClass, 'form-toggle-selected', 'ButtonToggle class was instantiated with correct selectedClass option');
    //    QUnit.equal(buttonToggleInitializeSpy.args[0][0].disabledClass, 'form-toggle-disabled', 'ButtonToggle class was instantiated with correct disabledClass option');
    //    QUnit.deepEqual(datePickerInitializeSpy.args[0][0].el, datepickerEl, 'InputField class was instantiated with correct options');
    //
    //    // test destruction
    //    QUnit.equal(inputFieldDestroySpy.callCount, 0, 'InputField class destroy() method was not yet triggered because destroy() wasnt called');
    //    QUnit.equal(buttonToggleDestroySpy.callCount, 0, 'ButtonToggle class destroy() method was not yet triggered');
    //    QUnit.equal(datePickerDestroySpy.callCount, 0, 'DatePicker class destroy() method was not yet triggered');
    //    formInstance.destroy();
    //    QUnit.equal(inputFieldDestroySpy.callCount, 1, 'after destroy() is called, InputField class instance was destroyed');
    //    QUnit.equal(buttonToggleDestroySpy.callCount, 1, 'ButtonToggle class instance was destroyed');
    //    QUnit.equal(datePickerDestroySpy.callCount, 1, 'DatePicker class instance was destroyed');
    //
    //    inputFieldDestroySpy.restore();
    //    inputFieldInitializeSpy.restore();
    //    buttonToggleDestroySpy.restore();
    //    buttonToggleInitializeSpy.restore();
    //    datePickerDestroySpy.restore();
    //    datePickerInitializeSpy.restore();
    //});
    //
    //// TODO: fix/enable the following tests that pass but fail in phantomjs
    ////QUnit.test('change events for datepicker', function () {
    ////    QUnit.expect(3);
    ////    var $fixture = $('#qunit-fixture');
    ////    var el = $(formHtml)[0];
    ////    $fixture.append(el);
    ////    var datePickerInitializeSpy = Sinon.spy(DatePicker.prototype, 'initialize');
    ////    var onChangeSpy = Sinon.spy();
    ////    var instance = new Form({el: el, onValueChange: onChangeSpy});
    ////    instance.setup();
    ////    QUnit.equal(onChangeSpy.callCount, 0, 'onValueChange callback was NOT yet fired because no change event was triggered');
    ////    // test date picker change event
    ////    var datepickerEl = el.getElementsByClassName('form-field-date')[0];
    ////    var changeEvent = document.createEvent('CustomEvent');
    ////    changeEvent.initCustomEvent('change', false, false);
    ////    datepickerEl.dispatchEvent(changeEvent);
    ////    QUnit.deepEqual(onChangeSpy.args[0], [datepickerEl.value, datepickerEl, undefined], 'after change event was triggered, onValueChange callback was fired with correct args');
    ////    instance.destroy();
    ////    var changeEvent = document.createEvent('CustomEvent');
    ////    changeEvent.initCustomEvent('change', false, false);
    ////    datepickerEl.dispatchEvent(changeEvent);
    ////    QUnit.equal(onChangeSpy.callCount, 1, 'after destroy, onValueChange was not triggered after change event happens');
    ////    datePickerInitializeSpy.restore();
    ////});
    //
    //QUnit.test('input field change events', function () {
    //    QUnit.expect(3);
    //    var formEl = $(formHtml)[0];
    //    var onChangeSpy = Sinon.spy();
    //    var instance = new Form({el: formEl, onValueChange: onChangeSpy});
    //    instance.setup();
    //    QUnit.equal(onChangeSpy.callCount, 0, 'onValueChange callback was NOT yet fired because no change event was triggered');
    //    // test change event
    //    var inputEl = formEl.getElementsByClassName('form-field-text')[0];
    //    var changeEvent = document.createEvent('CustomEvent');
    //    changeEvent.initCustomEvent('change', false, false);
    //    var testNewValue = 'newVal';
    //    inputEl.value = testNewValue; // reflect change in inputs value
    //    inputEl.dispatchEvent(changeEvent);
    //    QUnit.equal(onChangeSpy.args[0][0], testNewValue, 'after change event was triggered, onValueChange callback was fired with correct first arg');
    //    QUnit.deepEqual(onChangeSpy.args[0][1], inputEl, 'onValueChange callback was passed correct second arg');
    //    instance.destroy();
    //    // TODO: figure out why the following test doesnt pass!
    //    //var changeEvent = document.createEvent('CustomEvent');
    //    //changeEvent.initCustomEvent('change', false, false);
    //    //inputEl.dispatchEvent(changeEvent);
    //    //QUnit.equal(onChangeSpy.callCount, 1, 'after destroy, onValueChange was not triggered after change event happens');
    //});
    //
    //QUnit.test('getting current values', function () {
    //    QUnit.expect(1);
    //    var el = $(formHtml)[0];
    //    var currentValues = [{test: 'one'}];
    //    var elementKitFormGetCurrentValuesStub = Sinon.stub(FormJS.prototype, 'getCurrentValues');
    //    elementKitFormGetCurrentValuesStub.returns(currentValues);
    //    var instance = new Form({el: el});
    //    instance.setup();
    //    QUnit.deepEqual(instance.getCurrentValues(), currentValues, 'calling getCurrentValues() returns Element Kit\'s getCurrentValues method');
    //    instance.destroy();
    //    elementKitFormGetCurrentValuesStub.restore();
    //});
    //
    //QUnit.test('using custom initialize options', function () {
    //    QUnit.expect(14);
    //    var el = $(formHtml)[0];
    //    var onGetOptionsStub = Sinon.stub();
    //    // setup for input field
    //    var inputField = el.getElementsByClassName('form-field-text')[0];
    //    var inputFieldInitializeStub = Sinon.spy(InputField.prototype, 'initialize');
    //    var inputFieldOptions = {el: null, option2: 'text', onChange: Sinon.spy()};
    //    onGetOptionsStub.withArgs(inputField).returns(inputFieldOptions);
    //    // setup for toggle
    //    var buttonToggleInitializeStub = Sinon.spy(ButtonToggle.prototype, 'initialize');
    //    var toggleContainer = el.getElementsByClassName('form-toggle-group')[0];
    //    var toggleOptions = {el: null, togOption: 'tg2', onChange: Sinon.spy()};
    //    onGetOptionsStub.withArgs(toggleContainer).returns(toggleOptions);
    //    // setup for date picker
    //    var datePickerInitializeStub = Sinon.spy(DatePicker.prototype, 'initialize');
    //    var datepickerEl = el.getElementsByClassName('form-field-date')[0];
    //    var datepickerOptions = {el: null, dp: 'test', onChange: Sinon.spy()};
    //    onGetOptionsStub.withArgs(datepickerEl).returns(datepickerOptions);
    //    // begin test
    //    var formInstance = new Form({el: el, onGetOptions: onGetOptionsStub});
    //    QUnit.equal(onGetOptionsStub.callCount, 0, 'onGetOptions callback was not fired because setup() hasnt been triggered yet');
    //    // test setup
    //    formInstance.setup();
    //    // test input field instantiation
    //    QUnit.deepEqual(onGetOptionsStub.args[0], [inputField], 'after setup(), onGetOptions callback\'s first call was passed correct element');
    //    QUnit.deepEqual(inputFieldInitializeStub.args[0][0].el, inputField, 'InputField class was instantiated with correct el option');
    //    QUnit.deepEqual(inputFieldInitializeStub.args[0][0].option2, 'text', 'InputField class was instantiated with correct custom second option');
    //    // test toggle instantiation
    //    QUnit.deepEqual(onGetOptionsStub.args[1], [toggleContainer], 'onGetOptions callback\'s second call was passed correct element');
    //    QUnit.deepEqual(buttonToggleInitializeStub.args[0][0].container, toggleContainer, 'ButtonToggle class was instantiated with correct container option');
    //    QUnit.equal(buttonToggleInitializeStub.args[0][0].inputClass, 'form-toggle-input', 'ButtonToggle class was instantiated with correct inputClass option');
    //    QUnit.equal(buttonToggleInitializeStub.args[0][0].containerClass, 'form-toggle', 'ButtonToggle class was instantiated with correct containerClass option');
    //    QUnit.equal(buttonToggleInitializeStub.args[0][0].selectedClass, 'form-toggle-selected', 'ButtonToggle class was instantiated with correct selectedClass option');
    //    QUnit.equal(buttonToggleInitializeStub.args[0][0].disabledClass, 'form-toggle-disabled', 'ButtonToggle class was instantiated with correct disabledClass option');
    //    QUnit.equal(buttonToggleInitializeStub.args[0][0].togOption, 'tg2', 'ButtonToggle class was instantiated with correct custom option');
    //    // test date picker instantiation
    //    QUnit.deepEqual(onGetOptionsStub.args[2], [datepickerEl], 'onGetOptions callback\'s third call was passed correct element');
    //    QUnit.deepEqual(datePickerInitializeStub.args[0][0].el, datepickerEl, 'DatePicker class was instantiated with correct el option');
    //    QUnit.deepEqual(datePickerInitializeStub.args[0][0].dp, 'test', 'DatePicker class was instantiated with correct custom option');
    //
    //    formInstance.destroy();
    //    inputFieldInitializeStub.restore();
    //    buttonToggleInitializeStub.restore();
    //    datePickerInitializeStub.restore();
    //});
    //

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