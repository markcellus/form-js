"use strict";
let Sinon = require('sinon');
let QUnit = require('qunit');
let TestUtils = require('test-utils');
let InputField = require('../src/input-field');

module.exports = (function () {

    QUnit.module('Input Field');

    let disabledClass = 'ui-input-text-disabled';
    let activeClass = 'ui-input-text-active';
    let inputClass = 'ui-input-text-input';
    let containerClass = 'ui-input-text';
    let placeholderClass = 'ui-input-text-placeholder';

    let html = '<label class="container"><input type="text" class=' + inputClass + ' value="" placeholder="Enter your name" name="first_name" /></label>';

    QUnit.test('initializing and destroying', function() {
        QUnit.expect(2);
        let fixture = document.getElementById('qunit-fixture');
        let container = TestUtils.createHtmlElement(html);
        fixture.appendChild(container);
        let inputEl = container.getElementsByClassName(inputClass)[0];
        let instance = new InputField({el: inputEl});
        let uiEl = container.getElementsByClassName(containerClass)[0];
        QUnit.ok(uiEl.childNodes[0].isEqualNode(inputEl), 'ui element was created with input element as its nested child');
        instance.destroy();
        QUnit.equal(inputEl.parentNode, container, 'after destroy, input element\'s parent node is back to original');
    });

    QUnit.test('focusing and blurring', function() {
        QUnit.expect(3);
        let fixture = document.getElementById('qunit-fixture');
        let container = TestUtils.createHtmlElement(html);
        fixture.appendChild(container);
        let inputEl = container.getElementsByClassName(inputClass)[0];
        let instance = new InputField({el: inputEl});
        let uiEl = container.getElementsByClassName(containerClass)[0];
        QUnit.ok(!uiEl.classList.contains(activeClass), 'input does not have active class initially');
        inputEl.dispatchEvent(TestUtils.createEvent('focus'));
        QUnit.ok(uiEl.classList.contains(activeClass), 'input now has active class after focus');
        inputEl.dispatchEvent(TestUtils.createEvent('blur'));
        QUnit.ok(!uiEl.classList.contains(activeClass), 'input does not have active class after it loses focus');
        instance.destroy();
    });

    QUnit.test('change callback firing', function() {
        QUnit.expect(6);
        let fixture = document.getElementById('qunit-fixture');
        let container = TestUtils.createHtmlElement(html);
        fixture.appendChild(container);
        let inputEl = container.getElementsByClassName(inputClass)[0];
        let onChangeSpy = Sinon.spy();
        let instance = new InputField({el: inputEl, onChange: onChangeSpy});
        let uiEl = container.getElementsByClassName(containerClass)[0];
        QUnit.equal(inputEl.value, '', 'input value is empty initially');
        QUnit.equal(onChangeSpy.callCount, 0, 'onChange callback was NOT fired yet');
        inputEl.focus();
        let abra = 'abrahkadabraaa!';
        instance.setValue(abra);
        QUnit.equal(inputEl.value, abra, 'setting a custom value to input reflects that new input value');
        QUnit.deepEqual(onChangeSpy.args[0], [inputEl.value, inputEl, uiEl], 'onChange callback was fired with correct args');
        inputEl.blur();
        QUnit.equal(inputEl.value, abra, 'input value still has custom value after input blur');
        QUnit.equal(onChangeSpy.callCount, 1, 'onChange callback was NOT fired');
        instance.destroy();
    });

    QUnit.test('initializing and destroying when initial value is present', function() {
        QUnit.expect(3);
        let container = TestUtils.createHtmlElement(html);
        let fixture = document.getElementById('qunit-fixture').appendChild(container);
        let input = container.getElementsByClassName(inputClass)[0];
        let origValue = 'testy';
        input.value = origValue; // add custom value before initialization
        let instance = new InputField({el: input});
        QUnit.equal(input.value, origValue, 'input has its initial value');
        let testValue2 = 'new testy';
        input.value = testValue2;
        QUnit.equal(input.value, testValue2, 'input has been set successfully');
        instance.destroy();
        QUnit.equal(input.value, origValue, 'after destroy, input returns the value that it was set to originally');
    });

    QUnit.test('enabling and disabling', function () {
        QUnit.expect(6);
        let fixture = document.getElementById('qunit-fixture');
        let container = TestUtils.createHtmlElement(html);
        fixture.appendChild(container);
        let inputEl = container.getElementsByClassName(inputClass)[0];
        let instance = new InputField({el: inputEl});
        let uiEl = container.getElementsByClassName(containerClass)[0];
        QUnit.ok(!uiEl.classList.contains(disabledClass), 'ui element does not have active class initially');
        QUnit.ok(!inputEl.disabled, 'input\'s disabled boolean returns falsy');
        instance.disable();
        QUnit.ok(uiEl.classList.contains(disabledClass), 'ui element has correct disabled class after disable()');
        QUnit.ok(inputEl.disabled, 'input\'s disabled boolean returns truthy');
        instance.enable();
        QUnit.ok(!uiEl.classList.contains(disabledClass), 'after enable() ui element does not have disabled class');
        QUnit.ok(!inputEl.disabled, 'input\'s disabled boolean returns falsy');
        instance.destroy();
    });

    QUnit.test('initialize and destroy when initially disabled', function() {
        QUnit.expect(5);
        let container = TestUtils.createHtmlElement(html);
        let fixture = document.getElementById('qunit-fixture').appendChild(container);
        let inputEl = container.getElementsByClassName(inputClass)[0];
        inputEl.setAttribute('disabled', 'true'); // make it so that input is checked initially
        let setAttrSpy = Sinon.spy(inputEl, 'setAttribute');
        let instance = new InputField({el: inputEl});
        let uiEl = container.getElementsByClassName(containerClass)[0];
        QUnit.ok(inputEl.disabled, 'input was disabled initially');
        QUnit.ok(uiEl.classList.contains(disabledClass), 'ui element has disabled class initially because original input was disabled initially');
        QUnit.equal(setAttrSpy.callCount, 0, 'setAttribute was NOT called to ensure no unnecessary change events are fired');
        instance.enable();
        QUnit.ok(!uiEl.classList.contains(disabledClass), 'when enabling, ui element\'s disabled class is removed');
        instance.destroy();
        QUnit.ok(inputEl.disabled, 'input disabled boolean returns true because that\'s how it was initially');
        setAttrSpy.restore();
    });

    QUnit.asyncTest('onKeyDownChange event', function() {
        QUnit.expect(2);
        let fixture = document.getElementById('qunit-fixture');
        let container = TestUtils.createHtmlElement(html);
        fixture.appendChild(container);
        let inputEl = container.getElementsByClassName(inputClass)[0];
        let onChangeSpy = Sinon.spy();
        let instance = new InputField({el: inputEl, onKeyDownChange: onChangeSpy});
        let uiEl = container.getElementsByClassName(containerClass)[0];
        let testValue = 'aha';
        inputEl.value = testValue;
        // trigger keydown event
        let keydownEvent = document.createEvent('HTMLEvents');
        keydownEvent.initEvent('keydown', false, true);
        inputEl.dispatchEvent(keydownEvent);
        let newTestValue = testValue + '!';
        inputEl.value = newTestValue; // reflect new character change in input field
        setTimeout(function () {
            QUnit.deepEqual(onChangeSpy.args[0], [inputEl.value, inputEl, uiEl, keydownEvent], 'after 2 milliseconds of a new character change in the input field, onKeyDownChange callback was fired with correct args');
            QUnit.equal(instance.getValue(), newTestValue, 'getValue() returns new value');
            instance.destroy();
            QUnit.start();
        },2);
    });

    QUnit.test('should clear the input value to empty string when clear() is called', function() {
        QUnit.expect(2);
        let container = TestUtils.createHtmlElement(html);
        document.getElementById('qunit-fixture').appendChild(container);
        let inputEl = container.getElementsByClassName(inputClass)[0];
        let instance = new InputField({el: inputEl});
        let newValue = 'myNewValue';
        instance.setValue(newValue);
        QUnit.equal(inputEl.value, newValue, 'input value has been changed');
        instance.clear();
        QUnit.equal(inputEl.value, '', 'input value was cleared after clear()');
        instance.destroy();
    });

    QUnit.test('should set the input field as the value passed in the options', function() {
        QUnit.expect(1);
        let container = TestUtils.createHtmlElement(html);
        let fixture = document.getElementById('qunit-fixture').appendChild(container);
        let input = container.getElementsByClassName(inputClass)[0];
        let myValue = 'testy';
        let instance = new InputField({el: input, value: myValue});
        QUnit.equal(input.value, myValue);
        instance.destroy();
    });


})();
