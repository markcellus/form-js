"use strict";
let Sinon = require('sinon');
let QUnit = require('qunit');
let TestUtils = require('test-utils');
let TextArea = require('../src/text-area');

module.exports = (function () {

    QUnit.module('Text Area');

    QUnit.test('initializing injects element under a parent node', function() {
        QUnit.expect(1);
        let html = '<div><textarea></textarea></div>';
        let container = TestUtils.createHtmlElement(html);
        document.getElementById('qunit-fixture').appendChild(container);
        let textareaEl = container.getElementsByTagName('textarea')[0];
        let instance = new TextArea({el: textareaEl});
        QUnit.ok(container.childNodes[0].childNodes[0].isEqualNode(textareaEl));
        instance.destroy();
    });

    QUnit.test('destroying places the element back under its original parent', function() {
        QUnit.expect(1);
        let html = '<div><textarea></textarea></div>';
        let container = TestUtils.createHtmlElement(html);
        document.getElementById('qunit-fixture').appendChild(container);
        let textareaEl = container.getElementsByTagName('textarea')[0];
        let instance = new TextArea({el: textareaEl});
        instance.destroy();
        QUnit.equal(textareaEl.parentNode, container, 'after destroy, input element\'s parent node is back to original');
    });

    QUnit.test('should add the active class to the built container when focusing on element and remove it when blurring', function() {
        QUnit.expect(3);
        let html = '<div><textarea></textarea></div>';
        let wrapper = TestUtils.createHtmlElement(html);
        document.getElementById('qunit-fixture').appendChild(wrapper);
        let textareaEl = wrapper.getElementsByTagName('textarea')[0];
        let activeClass = 'ta-active';
        let containerClass = 'ta-container';
        let instance = new TextArea({
            el: textareaEl,
            activeClass: activeClass,
            containerClass: containerClass
        });
        let container = wrapper.getElementsByClassName(containerClass)[0];
        QUnit.ok(!container.classList.contains(activeClass), 'container has active class initially');
        textareaEl.dispatchEvent(TestUtils.createEvent('focus'));
        QUnit.ok(container.classList.contains(activeClass), 'container has active class after focus');
        textareaEl.dispatchEvent(TestUtils.createEvent('blur'));
        QUnit.ok(!container.classList.contains(activeClass), 'container no longer has active class after it loses focus');
        instance.destroy();
    });

    QUnit.test('should fire onChange callback when changing to a new value via setValue()', function() {
        QUnit.expect(8);
        let fixture = document.getElementById('qunit-fixture');
        let textareaEl = TestUtils.createHtmlElement('<textarea></textarea>');
        fixture.appendChild(textareaEl);
        let onChangeSpy = Sinon.spy();
        let containerClass = 'my-container';
        let instance = new TextArea({el: textareaEl, onChange: onChangeSpy, containerClass: containerClass});
        let container = fixture.getElementsByClassName(containerClass)[0];
        QUnit.equal(textareaEl.value, '', 'input value is empty initially');
        QUnit.equal(onChangeSpy.callCount, 0, 'onChange callback was NOT fired yet');
        textareaEl.focus();
        let abra = 'abrahkadabraaa!';
        instance.setValue(abra);
        QUnit.equal(textareaEl.value, abra, 'setting a custom value to input reflects that new input value');
        QUnit.deepEqual(onChangeSpy.args[0][0], textareaEl.value, 'onChange callback was fired with value of textarea as first arg');
        QUnit.deepEqual(onChangeSpy.args[0][1], textareaEl, 'onChange callback was fired with text area element as second arg');
        QUnit.deepEqual(onChangeSpy.args[0][2], container, 'onChange callback was fired the container as the third arg');
        textareaEl.blur();
        QUnit.equal(textareaEl.value, abra, 'input value still has custom value after input blur');
        QUnit.equal(onChangeSpy.callCount, 1, 'onChange callback was NOT fired');
        instance.destroy();
    });

    QUnit.test('initial value is restored upon destruction even after a new one was set', function() {
        QUnit.expect(3);
        let fixture = document.getElementById('qunit-fixture');
        let textareaEl = TestUtils.createHtmlElement('<textarea></textarea>');
        fixture.appendChild(textareaEl);
        let origValue = 'testy';
        textareaEl.value = origValue; // add custom value before initialization
        let instance = new TextArea({el: textareaEl});
        QUnit.equal(textareaEl.value, origValue, 'input has its initial value');
        let testValue2 = 'new testy';
        textareaEl.value = testValue2;
        QUnit.equal(textareaEl.value, testValue2, 'input has been set successfully');
        instance.destroy();
        QUnit.equal(textareaEl.value, origValue, 'after destroy, input returns the value that it was set to originally');
    });

    QUnit.test('enable() should set element\'s disabled boolean to true and disable() should make it false', function () {
        QUnit.expect(3);
        let fixture = document.getElementById('qunit-fixture');
        let textareaEl = TestUtils.createHtmlElement('<textarea></textarea>');
        fixture.appendChild(textareaEl);
        let instance = new TextArea({el: textareaEl});
        QUnit.ok(!textareaEl.disabled, 'disabled boolean returns falsy');
        instance.disable();
        QUnit.ok(textareaEl.disabled, 'disabled boolean returns truthy');
        instance.enable();
        QUnit.ok(!textareaEl.disabled, 'disabled boolean returns falsy');
        instance.destroy();
    });

    QUnit.test('enable() should add disabled class to container and disable() should remove it', function () {
        QUnit.expect(3);
        let fixture = document.getElementById('qunit-fixture');
        let textareaEl = TestUtils.createHtmlElement('<textarea></textarea>');
        fixture.appendChild(textareaEl);
        let disabledClass = 'text-disabled';
        let containerClass = 'text-wrapper';
        let instance = new TextArea({
            el: textareaEl,
            disabledClass: disabledClass,
            containerClass: containerClass
        });
        let containerEl = fixture.getElementsByClassName(containerClass)[0];
        QUnit.ok(!containerEl.classList.contains(disabledClass), 'does not have active class initially');
        instance.disable();
        QUnit.ok(containerEl.classList.contains(disabledClass), 'has correct disabled class after disable()');
        instance.enable();
        QUnit.ok(!containerEl.classList.contains(disabledClass), 'does not have disabled class after enable()');
        instance.destroy();
    });

    QUnit.test('should add disabled class to container if textarea element originally has a disabled property set to true', function() {
        QUnit.expect(4);
        let fixture = document.getElementById('qunit-fixture');
        let textareaEl = TestUtils.createHtmlElement('<textarea></textarea>');
        fixture.appendChild(textareaEl);
        let disabledClass = 'text-disabled';
        let containerClass = 'text-wrapper';
        textareaEl.setAttribute('disabled', 'true'); // make it so that textarea is disabled initially
        let instance = new TextArea({
            el: textareaEl,
            disabledClass: disabledClass,
            containerClass: containerClass
        });
        let containerEl = fixture.getElementsByClassName(containerClass)[0];
        QUnit.ok(textareaEl.disabled, 'textarea is disabled initially');
        QUnit.ok(containerEl.classList.contains(disabledClass), 'container has disabled class initially because original input was disabled initially');
        instance.enable();
        QUnit.ok(!containerEl.classList.contains(disabledClass), 'when enabling, ui element\'s disabled class is removed');
        instance.destroy();
        QUnit.ok(textareaEl.disabled, 'input disabled boolean returns true because that\'s how it was initially');
    });

    QUnit.test('setAttribute() should NOT be called when textarea is disabled before initialize', function() {
        QUnit.expect(2);
        let fixture = document.getElementById('qunit-fixture');
        let textareaEl = TestUtils.createHtmlElement('<textarea></textarea>');
        fixture.appendChild(textareaEl);
        let disabledClass = 'text-disabled';
        let containerClass = 'text-wrapper';
        // make it so that textarea is disabled initially
        textareaEl.setAttribute('disabled', 'true');
        let setAttrSpy = Sinon.spy(textareaEl, 'setAttribute');
        let instance = new TextArea({
            el: textareaEl,
            disabledClass: disabledClass,
            containerClass: containerClass
        });
        QUnit.ok(textareaEl.disabled, 'textarea is disabled initially');
        QUnit.equal(setAttrSpy.callCount, 0, 'setAttribute was NOT called to ensure no unnecessary change events are fired');
        instance.destroy();
        setAttrSpy.restore();
    });

    QUnit.asyncTest('onKeyDownChange event should fire with new value after the textarea value has been changed', function() {
        QUnit.expect(2);
        let fixture = document.getElementById('qunit-fixture');
        let textareaEl = TestUtils.createHtmlElement('<textarea></textarea>');
        fixture.appendChild(textareaEl);
        let containerClass = 'text-wrapper';
        let onChangeSpy = Sinon.spy();
        let instance = new TextArea({
            el: textareaEl,
            onKeyDownChange: onChangeSpy,
            containerClass: containerClass
        });
        let containerEl = fixture.getElementsByClassName(containerClass)[0];
        let testValue = 'aha';
        textareaEl.value = testValue;
        // trigger keydown event
        let keydownEvent = document.createEvent('HTMLEvents');
        keydownEvent.initEvent('keydown', false, true);
        textareaEl.dispatchEvent(keydownEvent);
        let newTestValue = testValue + '!';
        textareaEl.value = newTestValue; // reflect new character change in input field
        setTimeout(function () {
            QUnit.deepEqual(onChangeSpy.args[0], [textareaEl, containerEl, keydownEvent], 'after 2 milliseconds of a new character change in the input field, onKeyDownChange callback was fired with correct args');
            QUnit.equal(instance.getValue(), newTestValue, 'getValue() returns new value');
            instance.destroy();
            QUnit.start();
        },2);
    });

    QUnit.test('should clear the textarea value to empty string when clear() is called', function() {
        QUnit.expect(2);
        let fixture = document.getElementById('qunit-fixture');
        let textareaEl = TestUtils.createHtmlElement('<textarea></textarea>');
        fixture.appendChild(textareaEl);
        let instance = new TextArea({el: textareaEl});
        let newValue = 'myNewValue';
        instance.setValue(newValue);
        QUnit.equal(textareaEl.value, newValue, 'input value has been changed');
        instance.clear();
        QUnit.equal(textareaEl.value, '', 'input value was cleared after clear()');
        instance.destroy();
    });

    QUnit.test('should set the element\'s value to the value passed in the initialize options', function() {
        QUnit.expect(1);
        let fixture = document.getElementById('qunit-fixture');
        let textareaEl = TestUtils.createHtmlElement('<textarea></textarea>');
        fixture.appendChild(textareaEl);
        let myValue = 'testy';
        let instance = new TextArea({el: textareaEl, value: myValue});
        QUnit.equal(textareaEl.value, myValue);
        instance.destroy();
    });

})();
