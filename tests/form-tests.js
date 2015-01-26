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

    // TODO: get all test below (migrated from ETR) working

    QUnit.test('setting up and destroying elements', function () {
        QUnit.expect(16);
        var el = $(formHtml)[0];

        // setup stubs
        var inputFieldInitializeSpy = Sinon.spy(Form.InputField.prototype, 'initialize');
        var inputFieldDestroySpy = Sinon.spy(Form.InputField.prototype, 'destroy');
        var buttonToggleInitializeSpy = Sinon.spy(Form.ButtonToggle.prototype, 'initialize');
        var buttonToggleDestroySpy = Sinon.spy(Form.ButtonToggle.prototype, 'destroy');

        // cache els
        var inputField = el.getElementsByClassName('form-field-text')[0];
        var toggleContainer = el.getElementsByClassName('form-toggle-group')[0];

        var formInstance = new Form({
            el: el,
            inputFields: el.getElementsByClassName('form-field-text'),
            buttonToggles: el.getElementsByClassName('form-toggle-group')
        });

        // test setup
        QUnit.equal(inputFieldInitializeSpy.callCount, 0, 'InputField class was not yet initialized because setup() wasnt triggered yet');
        QUnit.equal(buttonToggleInitializeSpy.callCount, 0, 'ButtonToggle class was not yet initialized');
        formInstance.setup();
        QUnit.deepEqual(inputFieldInitializeSpy.args[0][0].el, inputField, 'after setting up, InputField class was instantiated with correct options');
        QUnit.deepEqual(buttonToggleInitializeSpy.args[0][0].container, toggleContainer, 'ButtonToggle class was instantiated with correct container option');
        QUnit.equal(buttonToggleInitializeSpy.args[0][0].inputClass, 'form-toggle-input', 'ButtonToggle class was instantiated with correct inputClass option');
        QUnit.equal(buttonToggleInitializeSpy.args[0][0].containerClass, 'form-toggle', 'ButtonToggle class was instantiated with correct containerClass option');
        QUnit.equal(buttonToggleInitializeSpy.args[0][0].selectedClass, 'form-toggle-selected', 'ButtonToggle class was instantiated with correct selectedClass option');
        QUnit.equal(buttonToggleInitializeSpy.args[0][0].disabledClass, 'form-toggle-disabled', 'ButtonToggle class was instantiated with correct disabledClass option');

        // test destruction
        QUnit.equal(inputFieldDestroySpy.callCount, 0, 'InputField class destroy() method was not yet triggered because destroy() wasnt called');
        QUnit.equal(buttonToggleDestroySpy.callCount, 0, 'ButtonToggle class destroy() method was not yet triggered');
        formInstance.destroy();
        QUnit.equal(inputFieldDestroySpy.callCount, 1, 'after destroy() is called, InputField class instance was destroyed');
        QUnit.equal(buttonToggleDestroySpy.callCount, 1, 'ButtonToggle class instance was destroyed');

        inputFieldDestroySpy.restore();
        inputFieldInitializeSpy.restore();
        buttonToggleDestroySpy.restore();
        buttonToggleInitializeSpy.restore();
    });

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
    //QUnit.test('getInstanceByName()', function () {
    //    QUnit.expect(1);
    //    var el = $(formHtml)[0];
    //    var instance = new Form({el: el});
    //    var toggleEl = el.getElementsByClassName('form-toggle-input1')[0];
    //    instance.setup();
    //    QUnit.deepEqual(instance.getInstanceByName('test_toggle1').getFormElement(), toggleEl, 'querying getInstanceByName() returns correct instance');
    //    instance.destroy();
    //});

});