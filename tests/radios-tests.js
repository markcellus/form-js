"use strict";
let Sinon = require('sinon');
let QUnit = require('qunit');
let TestUtils = require('test-utils');
let Radios = require('../src/radios');

module.exports = (function () {

    QUnit.module('Radios');

    let radioHtml = '' +
        '<div class="container">' +
        '<label><input type="radio" class="ui-radio-input" value="AAPL" name="stocks" />Apple</label>' +
        '<label><input type="radio" class="ui-radio-input" value="FB" name="stocks" />Facebook</label>' +
        '<label><input type="radio" class="ui-radio-input" value="VZ" name="stocks" />Verizon</label>' +
        '</div>';

    let selectedClass = 'ui-radio-selected',
        disabledClass = 'ui-radio-disabled';

    QUnit.test('initializing/destroying', function() {
        QUnit.expect(6);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        let containers = wrapper.getElementsByTagName('label');
        let instance = new Radios({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-radio');
        QUnit.ok(UIElements[0].childNodes[0].isEqualNode(inputs[0]), 'after init, ui button toggle wrapper html was created for first el');
        QUnit.ok(UIElements[1].childNodes[0].isEqualNode(inputs[1]), 'ui button toggle wrapper html was created for second el');
        QUnit.ok(UIElements[2].childNodes[0].isEqualNode(inputs[2]), 'ui button toggle wrapper html was created for third el');
        instance.destroy();
        QUnit.equal(inputs[0].parentNode, containers[0], 'after destroy, first input element\'s parent node is back to original');
        QUnit.equal(inputs[1].parentNode, containers[1], 'second input element\'s parent node is back to original');
        QUnit.equal(inputs[2].parentNode, containers[2], 'third input element\'s parent node is back to original');
    });

    QUnit.test('selecting and deselecting', function() {
        QUnit.expect(28);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        let onChangeSpy = Sinon.spy();
        let instance = new Radios({inputs: inputs, onChange: onChangeSpy});
        let UIElements = wrapper.getElementsByClassName('ui-radio');
        // select first toggle
        instance.select(0);
        QUnit.deepEqual(onChangeSpy.args[0], [inputs[0].value, inputs[0], UIElements[0]], 'onChange callback fired with correct args when select() was called on first toggle');
        QUnit.ok(inputs[0].checked, 'first toggle input boolean returns truthy');
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first toggle ui element contains active class');
        QUnit.ok(!inputs[1].checked, 'second toggle input boolean returns falsy');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second toggle ui element does NOT contain active class');
        QUnit.ok(!inputs[2].checked, 'third toggle input boolean returns falsy');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third toggle ui element does NOT contain active class');
        // select first toggle again
        instance.select(0);
        QUnit.equal(onChangeSpy.callCount, 1, 'clicking on first toggle again, does NOT fire onChange callback');
        QUnit.ok(inputs[0].checked, 'first toggle input boolean still returns truthy');
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first toggle ui element still contains active class');
        QUnit.ok(!inputs[1].checked, 'second toggle input boolean returns falsy');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second toggle ui element does NOT contain active class');
        QUnit.ok(!inputs[2].checked, 'third toggle input boolean returns falsy');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third toggle ui element does NOT contain active class');
        // select second toggle
        instance.select(1);
        QUnit.deepEqual(onChangeSpy.args[1], [inputs[1].value, inputs[1], UIElements[1]], 'onChange callback fired with correct args when select() was called on second toggle');
        QUnit.ok(inputs[1].checked, 'second toggle input boolean returns truthy');
        QUnit.ok(UIElements[1].classList.contains(selectedClass), 'second toggle ui element contains active class');
        QUnit.ok(!inputs[0].checked, 'first toggle input boolean returns falsy');
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first toggle ui element does NOT contain active class');
        QUnit.ok(!inputs[2].checked, 'third toggle input boolean returns falsy');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third toggle ui element does NOT contain active class');
        // select third toggle
        instance.select(2);
        QUnit.deepEqual(onChangeSpy.args[2], [inputs[2].value, inputs[2], UIElements[2]], 'onChange callback fired with correct args when select() was called on third toggle');
        QUnit.ok(inputs[2].checked, 'third toggle input boolean returns truthy');
        QUnit.ok(UIElements[2].classList.contains(selectedClass), 'third toggle ui element contains active class');
        QUnit.ok(!inputs[0].checked, 'first toggle input boolean returns falsy');
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first toggle ui element does NOT contain active class');
        QUnit.ok(!inputs[1].checked, 'second toggle input boolean returns falsy');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second toggle ui element does NOT contain active class');
        instance.destroy();
    });

    QUnit.test('clicking on input elements should apply and remove appropriate active classes', function() {
        QUnit.expect(12);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        let instance = new Radios({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-radio');
        // click first toggle
        inputs[0].click();
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first input input contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second input input does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third input input does NOT contain active class');
        // click first input again
        inputs[0].click();
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first input ui element still contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second input ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third input ui element does NOT contain active class');
        // click second input
        inputs[1].click();
        QUnit.ok(UIElements[1].classList.contains(selectedClass), 'second input ui element contains active class');
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first input ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third input ui element does NOT contain active class');
        // click third input
        inputs[2].click();
        QUnit.ok(UIElements[2].classList.contains(selectedClass), 'third input ui element contains active class');
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first input ui element does NOT contain active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second input ui element does NOT contain active class');
        instance.destroy();
    });

    QUnit.test('clicking on input elements should trigger onChange callback', function() {
        QUnit.expect(4);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        let onChangeSpy = Sinon.spy();
        let instance = new Radios({inputs: inputs, onChange: onChangeSpy});
        let UIElements = wrapper.getElementsByClassName('ui-radio');
        // click first toggle
        inputs[0].click();
        QUnit.deepEqual(onChangeSpy.args[0], [inputs[0].value, inputs[0], UIElements[0]], 'clicking on first input input, fires onChange callback with correct args');
        // click first input again
        inputs[0].click();
        QUnit.equal(onChangeSpy.callCount, 1, 'clicking on first input input again, does NOT fire onChange callback');
        // click second input
        inputs[1].click();
        QUnit.deepEqual(onChangeSpy.args[1], [inputs[1].value, inputs[1], UIElements[1]], 'clicking on second input input, fires onChange callback with correct args');
        // click third input
        inputs[2].click();
        QUnit.deepEqual(onChangeSpy.args[2], [inputs[2].value, inputs[2], UIElements[2]], 'clicking on third input input, fires onChange callback with correct args');
        instance.destroy();
    });

    QUnit.test('clicking on input elements should reflect correct checked boolean value', function() {
        QUnit.expect(12);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        let instance = new Radios({inputs: inputs});
        // click first toggle
        inputs[0].click();
        QUnit.ok(inputs[0].checked, 'after first click on first input, boolean is "true');
        QUnit.ok(!inputs[1].checked, 'second input, boolean is "false');
        QUnit.ok(!inputs[2].checked, 'third input, boolean is "false');
        // click first input again
        inputs[0].click();
        QUnit.ok(inputs[0].checked, 'after second click on first input, boolean is still "true');
        QUnit.ok(!inputs[1].checked, 'second input, boolean is "false');
        QUnit.ok(!inputs[2].checked, 'third input, boolean is "false');
        // click second input
        inputs[1].click();
        QUnit.ok(inputs[1].checked, 'after click on second input, boolean on it is "true');
        QUnit.ok(!inputs[0].checked, 'first input, boolean is "false');
        QUnit.ok(!inputs[2].checked, 'third input, boolean is "false');
        // click third input
        inputs[2].click();
        QUnit.ok(inputs[2].checked, 'after click on third input, boolean on it is "true');
        QUnit.ok(!inputs[0].checked, 'first input, boolean is "false');
        QUnit.ok(!inputs[1].checked, 'second input, boolean is "false');
        instance.destroy();
    });

    QUnit.test('clicking on input\'s parent label should add and remove css active classes appropriately', function() {
        QUnit.expect(12);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        let labels = wrapper.getElementsByTagName('label');
        let instance = new Radios({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-radio');
        // click first label
        labels[0].click();
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first label ui element contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second label ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third label ui element does NOT contain active class');
        // click first label again
        labels[0].click();
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first label ui element still contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second label ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third label ui element does NOT contain active class');
        // click second label
        labels[1].click();
        QUnit.ok(UIElements[1].classList.contains(selectedClass), 'second label ui element contains active class');
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first label ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third label ui element does NOT contain active class');
        // click third label
        UIElements[2].click();
        QUnit.ok(UIElements[2].classList.contains(selectedClass), 'third label ui element contains active class');
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first label ui element does NOT contain active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second label ui element does NOT contain active class');
        instance.destroy();
    });

    QUnit.test('clicking on input\'s parent label should call onChange callback', function() {
        QUnit.expect(4);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        let labels = wrapper.getElementsByTagName('label');
        let onChangeSpy = Sinon.spy();
        let instance = new Radios({inputs: inputs, onChange: onChangeSpy});
        let UIElements = wrapper.getElementsByClassName('ui-radio');
        // click first label
        labels[0].click();
        QUnit.deepEqual(onChangeSpy.args[0], [inputs[0].value, inputs[0], UIElements[0]], 'clicking on first label, fires onChange callback with correct args');
        // click first label again
        labels[0].click();
        QUnit.equal(onChangeSpy.callCount, 1, 'clicking on first label again, does NOT fire onChange callback');
        // click second label
        labels[1].click();
        QUnit.deepEqual(onChangeSpy.args[1], [inputs[1].value, inputs[1], UIElements[1]], 'clicking on second label, fires onChange callback with correct args');
        // click third label
        UIElements[2].click();
        QUnit.deepEqual(onChangeSpy.args[2], [inputs[2].value, inputs[2], UIElements[2]], 'clicking on third label, fires onChange callback with correct args');
        instance.destroy();
    });

    QUnit.test('clicking labels when they are not the input field\'s parent', function() {
        QUnit.expect(16);
        let radioHtml = '' +
            '<div class="container">' +
                '<label for="test-stock-apple">Apple</label>' +
                '<input type="radio" id="test-stock-apple" class="ui-radio-input" value="AAPL" name="stocks" />' +
                '<label for="test-stock-fb">Facebook</label>' +
                '<input type="radio"  id="test-stock-fb" class="ui-radio-input" value="FB" name="stocks" />' +
                '<label for="test-stock-vz">Verizon</label>' +
                '<input type="radio"  id="test-stock-vz" class="ui-radio-input" value="VZ" name="stocks" />' +
            '</div>';
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        let labels = wrapper.getElementsByTagName('label');
        let onChangeSpy = Sinon.spy();
        let instance = new Radios({inputs: inputs, onChange: onChangeSpy});
        let UIElements = wrapper.getElementsByClassName('ui-radio');
        // click first label
        labels[0].click();
        QUnit.deepEqual(onChangeSpy.args[0], [inputs[0].value, inputs[0], UIElements[0]], 'clicking on first label, fires onChange callback with correct args');
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first label ui element contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second label ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third label ui element does NOT contain active class');
        // click first label again
        labels[0].click();
        QUnit.equal(onChangeSpy.callCount, 1, 'clicking on first label again, does NOT fire onChange callback');
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first label ui element still contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second label ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third label ui element does NOT contain active class');
        // click second label
        labels[1].click();
        QUnit.deepEqual(onChangeSpy.args[1], [inputs[1].value, inputs[1], UIElements[1]], 'clicking on second label, fires onChange callback with correct args');
        QUnit.ok(UIElements[1].classList.contains(selectedClass), 'second label ui element contains active class');
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first label ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third label ui element does NOT contain active class');
        // click third label
        labels[2].click();
        QUnit.deepEqual(onChangeSpy.args[2], [inputs[2].value, inputs[2], UIElements[2]], 'clicking on third label, fires onChange callback with correct args');
        QUnit.ok(UIElements[2].classList.contains(selectedClass), 'third label ui element contains active class');
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first label ui element does NOT contain active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second label ui element does NOT contain active class');
        instance.destroy();
    });

    QUnit.test('getElementKey()', function() {
        QUnit.expect(1);
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        let radios = wrapper.getElementsByClassName('ui-radio-input');
        let instance = new Radios({inputs: radios});
        QUnit.equal(instance.getElementKey(), 'radios', 'getElementKey() method was called and returned "radios"');
        instance.destroy();
    });

    QUnit.test('initializing when checked initially', function() {
        QUnit.expect(3);
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        inputs[0].checked = true; // make it so that input is checked initially
        let onSelectedSpy = Sinon.spy();
        let instance = new Radios({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-radio');
        QUnit.equal(inputs[0].checked, true, 'first input\'s checked property returns true initially');
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first ui element toggle has active class initially because original input was checked initially');
        QUnit.equal(onSelectedSpy.callCount, 0, 'onSelected callback was NOT fired');
        instance.destroy();
    });

    QUnit.test('enabling and disabling', function () {
        QUnit.expect(18);
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        let instance = new Radios({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-radio');
        QUnit.ok(!UIElements[0].classList.contains(disabledClass), 'first toggle does not have active class initially');
        QUnit.ok(!inputs[0].disabled, 'first toggle input\'s disabled property returns falsy');
        QUnit.ok(!UIElements[1].classList.contains(disabledClass), 'second toggle does not have active class initially');
        QUnit.ok(!inputs[1].disabled, 'second toggle input\'s disabled property returns falsy');
        QUnit.ok(!UIElements[2].classList.contains(disabledClass), 'third toggle does not have active class initially');
        QUnit.ok(!inputs[2].disabled, 'third toggle input\'s disabled property returns falsy');
        instance.disable();
        QUnit.ok(UIElements[0].classList.contains(disabledClass), 'after calling disable(), first toggle does not have active class initially');
        QUnit.ok(inputs[0].disabled, 'first toggle input\'s disabled property returns truthy');
        QUnit.ok(UIElements[1].classList.contains(disabledClass), 'second toggle does not have active class initially');
        QUnit.ok(inputs[1].disabled, 'second toggle input\'s disabled property returns truthy');
        QUnit.ok(UIElements[2].classList.contains(disabledClass), 'third toggle does not have active class initially');
        QUnit.ok(inputs[2].disabled, 'third toggle input\'s disabled property returns truthy');
        instance.enable();
        QUnit.ok(!UIElements[0].classList.contains(disabledClass), 'after calling enable(), first toggle does not have active class initially');
        QUnit.ok(!inputs[0].disabled, 'first toggle input\'s disabled property returns falsy');
        QUnit.ok(!UIElements[1].classList.contains(disabledClass), 'second toggle does not have active class initially');
        QUnit.ok(!inputs[1].disabled, 'second toggle input\'s disabled property returns falsy');
        QUnit.ok(!UIElements[2].classList.contains(disabledClass), 'third toggle does not have active class initially');
        QUnit.ok(!inputs[2].disabled, 'third toggle input\'s disabled property returns falsy');
        instance.destroy();
    });

    QUnit.test('initializing when disabled initially', function() {
        QUnit.expect(2);
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        inputs[0].disabled = true; // disable input field initially
        let instance = new Radios({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-radio');
        QUnit.ok(inputs[0].disabled, 'first toggle input was disabled initially');
        QUnit.ok(UIElements[0].classList.contains(disabledClass), 'first toggle element has disabled class initially because original input was disabled initially');
        instance.destroy();
    });

    QUnit.test('getValue() should return the currently selected radio button\'s value', function() {
        QUnit.expect(2);
        let radioHtml = '' +
            '<div class="container">' +
            '<label><input type="radio" class="ui-radio-input" value="AAPL" name="stocks" />Apple</label>' +
            '<label><input type="radio" class="ui-radio-input" value="FB" name="stocks" />Facebook</label>' +
            '<label><input type="radio" class="ui-radio-input" value="VZ" name="stocks" />Verizon</label>' +
            '</div>';
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        document.getElementById('qunit-fixture').appendChild(wrapper);
        let radios = wrapper.getElementsByTagName('input');
        let instance = new Radios({inputs: radios});
        // click first toggle
        instance.select(1);
        QUnit.equal(instance.getValue(), radios[1].value, 'after selecting second toggle, getValue() returns second item\'s value');
        // click second toggle
        instance.select(2);
        QUnit.equal(instance.getValue(), radios[2].value, 'after selecting third toggle, getValue() returns third item\'s value');
        instance.destroy();
    });

    QUnit.test('clear() should unselect the currently selected radio button toggle', function() {
        QUnit.expect(4);
        let radioHtml = '' +
            '<div class="container">' +
            '<label><input type="radio" value="NY" name="state" />New York</label>' +
            '<label><input type="radio" value="MD" name="state" />Maryland</label>' +
            '<label><input type="radio" value="DC" name="state" />District Of Columbia</label>' +
            '</div>';
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        document.getElementById('qunit-fixture').appendChild(wrapper);
        let radios = wrapper.getElementsByTagName('input');
        let instance = new Radios({inputs: radios});
        // click second toggle
        instance.select(1);
        QUnit.equal(radios[1].checked, true, 'second item is original selected');
        // click third toggle
        instance.clear();
        QUnit.equal(radios[0].checked, false, 'after clear(), first item is not checked');
        QUnit.equal(radios[1].checked, false, 'second item is not checked');
        QUnit.equal(radios[2].checked, false, 'third item is not checked');
        instance.destroy();
    });


    QUnit.test('should select the toggle element with a value that matches the value passed into setValue()', function() {
        QUnit.expect(6);
        let fixture = document.getElementById('qunit-fixture');
        let selectValue = 'FB';
        let radioHtml = '' +
            '<div class="container">' +
                '<label><input type="radio" class="ui-radio-input" value="AAPL" name="stocks" />Apple</label>' +
                '<label><input type="radio" class="ui-radio-input" value="' + selectValue + '" name="stocks" />Facebook</label>' +
                '<label><input type="radio" class="ui-radio-input" value="VZ" name="stocks" />Verizon</label>' +
            '</div>';
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        fixture.appendChild(wrapper);
        let radios = wrapper.getElementsByTagName('input');
        let fbRadioInput = wrapper.querySelector('input[value="' + selectValue + '"]');
        let appRadioInput = wrapper.querySelector('input[value="AAPL"]');
        let vzRadioInput = wrapper.querySelector('input[value="VZ"]');
        let instance = new Radios({inputs: radios});
        QUnit.equal(fbRadioInput.checked, false);
        QUnit.equal(appRadioInput.checked, false);
        QUnit.equal(vzRadioInput.checked, false);
        instance.setValue(selectValue);
        QUnit.equal(fbRadioInput.checked, true, 'correct radio button is selected after passing its matching value to setValue()');
        QUnit.equal(appRadioInput.checked, false);
        QUnit.equal(vzRadioInput.checked, false);
        instance.destroy();
    });

    QUnit.test('should check the radio button that matches the value of the options values passed in on initialize', function() {
        QUnit.expect(3);
        let val = 'FB';
        let html = '' +
            '<div class="container">' +
                '<label><input type="radio" value="AAPL" name="stocks" />Apple</label>' +
                '<label><input type="radio" value="' + val + '" name="stocks" />Facebook</label>' +
                '<label><input type="radio" value="VZ" name="stocks" />Verizon</label>' +
            '</div>';
        let wrapper = TestUtils.createHtmlElement(html);
        let inputs = wrapper.getElementsByTagName('input');
        let instance = new Radios({inputs: inputs, value: val});
        QUnit.equal(inputs[0].checked, false, 'first radio\'s checked property returns false because its value doesnt match value passed in initialize options');
        QUnit.equal(inputs[1].checked, true, 'second radio\'s checked property returns true initially because value was passed to options that matches it');
        QUnit.equal(inputs[2].checked, false, 'third radio\'s checked property returns false because its value doesnt match value passed in initialize options');
        instance.destroy();
    });

    QUnit.test('should NOT call onChange callback when clicking on input element after destruction', function() {
        QUnit.expect(1);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        let onChangeSpy = Sinon.spy();
        let instance = new Radios({inputs: inputs, onChange: onChangeSpy});
        instance.destroy();
        // click third input
        inputs[2].click();
        QUnit.equal(onChangeSpy.callCount, 0);
    });

    QUnit.test('clicking on ui elements should apply and remove appropriate active classes', function() {
        QUnit.expect(12);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        let instance = new Radios({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-radio');
        UIElements[0].click();
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first input input contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second input input does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third input input does NOT contain active class');
        UIElements[0].click();
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first input ui element still contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second input ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third input ui element does NOT contain active class');
        UIElements[1].click();
        QUnit.ok(UIElements[1].classList.contains(selectedClass), 'second input ui element contains active class');
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first input ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third input ui element does NOT contain active class');
        UIElements[2].click();
        QUnit.ok(UIElements[2].classList.contains(selectedClass), 'third input ui element contains active class');
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first input ui element does NOT contain active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second input ui element does NOT contain active class');
        instance.destroy();
    });

    QUnit.test('clicking on ui elements should trigger onChange callback', function() {
        QUnit.expect(4);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = TestUtils.createHtmlElement(radioHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-radio-input');
        let onChangeSpy = Sinon.spy();
        let instance = new Radios({inputs: inputs, onChange: onChangeSpy});
        let UIElements = wrapper.getElementsByClassName('ui-radio');
        UIElements[0].click();
        QUnit.deepEqual(onChangeSpy.args[0], [inputs[0].value, inputs[0], UIElements[0]], 'clicking on first input input, fires onChange callback with correct args');
        UIElements[0].click();
        QUnit.equal(onChangeSpy.callCount, 1, 'clicking on first input input again, does NOT fire onChange callback');
        UIElements[1].click();
        QUnit.deepEqual(onChangeSpy.args[1], [inputs[1].value, inputs[1], UIElements[1]], 'clicking on second input input, fires onChange callback with correct args');
        UIElements[2].click();
        QUnit.deepEqual(onChangeSpy.args[2], [inputs[2].value, inputs[2], UIElements[2]], 'clicking on third input input, fires onChange callback with correct args');
        instance.destroy();
    });

})();
