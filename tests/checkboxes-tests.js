import sinon from 'sinon';
import QUnit from 'qunit';
import {createHtmlElementFromString} from '../utils/element';
import Checkboxes from '../src/checkboxes';

module.exports = (function () {

    QUnit.module('Checkboxes');

    let checkboxHtml = '' +
        '<div class="container">' +
        '<label><input type="checkbox" class="ui-checkbox-input" value="NY" name="state1" />New York</label>' +
        '<label><input type="checkbox" class="ui-checkbox-input" value="MD" name="state2" />Maryland</label>' +
        '<label><input type="checkbox" class="ui-checkbox-input" value="DC" name="state3" />District Of Columbia</label>' +
        '</div>';

    let selectedClass = 'ui-checkbox-selected',
        disabledClass = 'ui-checkbox-disabled';

    QUnit.test('initializing/destroying', function() {
        QUnit.expect(6);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = createHtmlElementFromString(checkboxHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-checkbox-input');
        let containers = wrapper.getElementsByTagName('label');
        let instance = new Checkboxes({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-checkbox');
        QUnit.ok(UIElements[0].childNodes[0].isEqualNode(inputs[0]), 'after init, ui button toggle wrapper html was created for first el');
        QUnit.ok(UIElements[1].childNodes[0].isEqualNode(inputs[1]), 'ui button toggle wrapper html was created for second el');
        QUnit.ok(UIElements[2].childNodes[0].isEqualNode(inputs[2]), 'ui button toggle wrapper html was created for third el');
        instance.destroy();
        QUnit.equal(inputs[0].parentNode, containers[0], 'after destroy, first input element\'s parent node is back to original');
        QUnit.equal(inputs[1].parentNode, containers[1], 'second input element\'s parent node is back to original');
        QUnit.equal(inputs[2].parentNode, containers[2], 'third input element\'s parent node is back to original');
    });

    QUnit.test('selecting and deselecting', function() {
        QUnit.expect(14);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = createHtmlElementFromString(checkboxHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-checkbox-input');
        let onChangeSpy = sinon.spy();
        let instance = new Checkboxes({inputs: inputs, onChange: onChangeSpy});
        let UIElements = wrapper.getElementsByClassName('ui-checkbox');
        let onChangeCallCount = 0;
        // select first toggle
        instance.select(0);
        onChangeCallCount++;
        QUnit.deepEqual(onChangeSpy.args[onChangeCallCount - 1], [inputs[0].value, inputs[0], UIElements[0]], 'when first toggle item is clicked, onChange callback fired with correct args');
        QUnit.ok(inputs[0].checked, 'first toggle input boolean returns truthy');
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first toggle ui element contains active class');
        // deselect first toggle again
        instance.deselect(0);
        onChangeCallCount++;
        QUnit.deepEqual(onChangeSpy.args[onChangeCallCount - 1], [inputs[0].value, inputs[0], UIElements[0]], 'when first toggle item is clicked again, onChange callback fired with correct args');
        QUnit.ok(!inputs[0].checked, 'first toggle input boolean returns falsy');
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first toggle ui element does NOT contain active class');
        // select second toggle
        instance.select(1);
        onChangeCallCount++;
        QUnit.deepEqual(onChangeSpy.args[onChangeCallCount - 1], [inputs[1].value, inputs[1], UIElements[1]], ' when second toggle item is clicked, onChange callback fired with correct args');
        QUnit.ok(inputs[1].checked, 'second toggle input boolean returns truthy');
        QUnit.ok(UIElements[1].classList.contains(selectedClass), 'second toggle ui element contains active class');
        // select third toggle
        instance.select(2);
        onChangeCallCount++;
        QUnit.deepEqual(onChangeSpy.args[onChangeCallCount - 1], [inputs[2].value, inputs[2], UIElements[2]], 'when third toggle item is clicked, onChange callback fired with correct args');
        QUnit.ok(inputs[2].checked, 'third toggle input boolean returns truthy');
        QUnit.ok(UIElements[2].classList.contains(selectedClass), 'third toggle ui element contains active class');
        QUnit.ok(inputs[1].checked, 'second toggle input boolean still returns true');
        QUnit.ok(UIElements[1].classList.contains(selectedClass), 'second toggle ui element still contains active class');
        instance.destroy();
    });

    QUnit.test('clicking on input element should apply the appropriate active classes', function() {
        QUnit.expect(8);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = createHtmlElementFromString(checkboxHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-checkbox-input');
        let instance = new Checkboxes({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-checkbox');
        // click first input
        inputs[0].click();
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first input ui element contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second input ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third input ui element does NOT contain active class');
        // click first input again
        inputs[0].click();
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first input ui element no longer contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second input ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third input ui element does NOT contain active class');
        // click second input
        inputs[1].click();
        QUnit.ok(UIElements[1].classList.contains(selectedClass), 'second input ui element now contains active class');
        // click third input
        inputs[2].click();
        QUnit.ok(UIElements[2].classList.contains(selectedClass), 'third input ui element now contains active class');
        instance.destroy();
    });

    QUnit.test('clicking on input element should trigger onChange callback option', function() {
        QUnit.expect(4);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = createHtmlElementFromString(checkboxHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-checkbox-input');
        let onChangeSpy = sinon.spy();
        let instance = new Checkboxes({inputs: inputs, onChange: onChangeSpy});
        let UIElements = wrapper.getElementsByClassName('ui-checkbox');
        // click first input
        inputs[0].click();
        QUnit.deepEqual(onChangeSpy.args[0], [inputs[0].value, inputs[0], UIElements[0]], 'clicking on first input input fires onChange callback with correct args');
        // click first input again
        inputs[0].click();
        QUnit.deepEqual(onChangeSpy.args[1], [inputs[0].value, inputs[0], UIElements[0]], 'clicking on first input input again fires onChange callback again with correct args');
        // click second input
        inputs[1].click();
        QUnit.deepEqual(onChangeSpy.args[2], [inputs[1].value, inputs[1], UIElements[1]], 'clicking on second input input fires onChange callback with correct args');
        // click third input
        inputs[2].click();
        QUnit.deepEqual(onChangeSpy.args[3], [inputs[2].value, inputs[2], UIElements[2]], 'clicking on third input input fires onChange callback with correct args');
        instance.destroy();
    });

    QUnit.test('clicking on input\'s label parent adds and removes css active classes appropriately', function() {
        QUnit.expect(8);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = createHtmlElementFromString(checkboxHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-checkbox-input');
        let labels = wrapper.getElementsByTagName('label');
        let instance = new Checkboxes({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-checkbox');
        // click first label
        labels[0].click();
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first label ui element contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second label ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third label ui element does NOT contain active class');
        // click first label again
        labels[0].click();
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first label ui element no longer contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second label ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third label ui element does NOT contain active class');
        // click second label
        labels[1].click();
        QUnit.ok(UIElements[1].classList.contains(selectedClass), 'second label ui element now contains active class');
        // click third label
        labels[2].click();
        QUnit.ok(UIElements[2].classList.contains(selectedClass), 'third label ui element now contains active class');
        instance.destroy();
    });

    QUnit.test('clicking on input\'s label parent call onChange callback option', function() {
        QUnit.expect(4);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = createHtmlElementFromString(checkboxHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-checkbox-input');
        let labels = wrapper.getElementsByTagName('label');
        let onChangeSpy = sinon.spy();
        let instance = new Checkboxes({inputs: inputs, onChange: onChangeSpy});
        let UIElements = wrapper.getElementsByClassName('ui-checkbox');
        // click first label
        labels[0].click();
        QUnit.deepEqual(onChangeSpy.args[0], [inputs[0].value, inputs[0], UIElements[0]], 'clicking on first label fires onChange callback with correct args');
        // click first label again
        labels[0].click();
        QUnit.deepEqual(onChangeSpy.args[1], [inputs[0].value, inputs[0], UIElements[0]], 'clicking on first label again fires onChange callback again with correct args');
        // click second label
        labels[1].click();
        QUnit.deepEqual(onChangeSpy.args[2], [inputs[1].value, inputs[1], UIElements[1]], 'clicking on second label fires onChange callback with correct args');
        // click third label
        labels[2].click();
        QUnit.deepEqual(onChangeSpy.args[3], [inputs[2].value, inputs[2], UIElements[2]], 'clicking on third label fires onChange callback with correct args');
        instance.destroy();
    });

    QUnit.test('getElementKey()', function() {
        QUnit.expect(1);
        let wrapper = createHtmlElementFromString(checkboxHtml);
        let checkboxes = wrapper.getElementsByClassName('ui-checkbox-input');
        let instance = new Checkboxes({inputs: checkboxes});
        QUnit.equal(instance.getElementKey(), 'checkboxes', 'getElementKey() method was called and returned "checkboxes"');
        instance.destroy();
    });

    QUnit.test('initializing when checked initially', function() {
        QUnit.expect(3);
        let wrapper = createHtmlElementFromString(checkboxHtml);
        let inputs = wrapper.getElementsByClassName('ui-checkbox-input');
        inputs[0].checked = true; // make it so that input is checked initially
        let onSelectedSpy = sinon.spy();
        let instance = new Checkboxes({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-checkbox');
        QUnit.equal(inputs[0].checked, true, 'first input\'s checked property returns true initially');
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first ui element toggle has active class initially because original input was checked initially');
        QUnit.equal(onSelectedSpy.callCount, 0, 'onSelected callback was NOT fired');
        instance.destroy();
    });

    QUnit.test('enabling and disabling', function () {
        QUnit.expect(18);
        let wrapper = createHtmlElementFromString(checkboxHtml);
        let inputs = wrapper.getElementsByClassName('ui-checkbox-input');
        let instance = new Checkboxes({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-checkbox');
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
        let wrapper = createHtmlElementFromString(checkboxHtml);
        let inputs = wrapper.getElementsByClassName('ui-checkbox-input');
        inputs[0].disabled = true; // disable input field initially
        let instance = new Checkboxes({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-checkbox');
        QUnit.ok(inputs[0].disabled, 'first toggle input was disabled initially');
        QUnit.ok(UIElements[0].classList.contains(disabledClass), 'first toggle element has disabled class initially because original input was disabled initially');
        instance.destroy();
    });

    QUnit.test('getValue() should return all values of the currently selected checkboxes', function() {
        QUnit.expect(3);
        let checkboxHtml = '' +
            '<div class="container">' +
            '<label><input type="checkbox" value="NY" name="state1" />New York</label>' +
            '<label><input type="checkbox" value="MD" name="state2" />Maryland</label>' +
            '<label><input type="checkbox" value="DC" name="state3" />District Of Columbia</label>' +
            '</div>';
        let wrapper = createHtmlElementFromString(checkboxHtml);
        document.getElementById('qunit-fixture').appendChild(wrapper);
        let checkboxes = wrapper.getElementsByTagName('input');
        let instance = new Checkboxes({inputs: checkboxes});
        QUnit.equal(instance.getValue(), '', 'calling getValue() when there is no currently set value returns empty string');
        // select first checkbox
        instance.select(0);
        let testArray = [checkboxes[0].value];
        QUnit.deepEqual(instance.getValue(), testArray, 'after selecting first toggle, getValue() returns an array with first item\'s value');
        // click second toggle
        instance.select(1);
        testArray.push(checkboxes[1].value);
        QUnit.deepEqual(instance.getValue(), testArray, 'after selecting second toggle, getValue() returns an array with first and second item\'s value');
        instance.destroy();
    });

    QUnit.test('getValue() should return an empty array if no checkboxes are selected', function() {
        QUnit.expect(1);
        let checkboxHtml = '' +
            '<div class="container">' +
            '<label><input type="checkbox" value="NY" name="state1" />New York</label>' +
            '<label><input type="checkbox" value="MD" name="state2" />Maryland</label>' +
            '<label><input type="checkbox" value="DC" name="state3" />District Of Columbia</label>' +
            '</div>';
        let wrapper = createHtmlElementFromString(checkboxHtml);
        document.getElementById('qunit-fixture').appendChild(wrapper);
        let checkboxes = wrapper.getElementsByTagName('input');
        let instance = new Checkboxes({inputs: checkboxes});
        QUnit.deepEqual(instance.getValue(), []);
        instance.destroy();
    });

    QUnit.test('clear() should clear all checkbox button toggles', function() {
        QUnit.expect(1);
        let checkboxHtml = '' +
            '<div class="container">' +
                '<label><input type="checkbox" value="NY" name="state1" />New York</label>' +
                '<label><input type="checkbox" value="MD" name="state2" />Maryland</label>' +
                '<label><input type="checkbox" value="DC" name="state3" />District Of Columbia</label>' +
            '</div>';
        let wrapper = createHtmlElementFromString(checkboxHtml);
        document.getElementById('qunit-fixture').appendChild(wrapper);
        let checkboxes = wrapper.getElementsByTagName('input');
        let instance = new Checkboxes({inputs: checkboxes});
        instance.select(0); // select first toggle
        instance.select(1); // select second toggle
        instance.clear();
        QUnit.deepEqual(instance.getValue(), [], 'clear() returns empty array');
        instance.destroy();
    });

    QUnit.test('clear() should unselect the currently selected radio button toggle', function() {
        QUnit.expect(4);
        let checkboxHtml = '' +
            '<div class="container">' +
            '<label><input type="checkbox" value="NY" name="state1" />New York</label>' +
            '<label><input type="checkbox" value="MD" name="state2" />Maryland</label>' +
            '<label><input type="checkbox" value="DC" name="state3" />District Of Columbia</label>' +
            '</div>';
        let wrapper = createHtmlElementFromString(checkboxHtml);
        document.getElementById('qunit-fixture').appendChild(wrapper);
        let radios = wrapper.getElementsByTagName('input');
        let instance = new Checkboxes({inputs: radios});
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

    QUnit.test('getValue() should return empty array when clear() method is called on checkboxes', function() {
        QUnit.expect(2);
        let checkboxHtml = '' +
            '<div class="container">' +
            '<label><input type="checkbox" value="NY" name="state1" />New York</label>' +
            '<label><input type="checkbox" value="MD" name="state2" />Maryland</label>' +
            '<label><input type="checkbox" value="DC" name="state3" />District Of Columbia</label>' +
            '</div>';
        let wrapper = createHtmlElementFromString(checkboxHtml);
        document.getElementById('qunit-fixture').appendChild(wrapper);
        let radios = wrapper.getElementsByTagName('input');
        let instance = new Checkboxes({inputs: radios});
        // click second toggle
        instance.select(1);
        QUnit.equal(instance.getValue(), radios[1].value, 'second item is original selected');
        instance.clear();
        QUnit.deepEqual(instance.getValue(), [], 'after clear(), getValue() returns empty value');
        instance.destroy();
    });

    QUnit.test('should select the checkbox element with a value that matches the value passed into setValue()', function() {
        QUnit.expect(6);
        let fixture = document.getElementById('qunit-fixture');
        let selectValue = 'MD';
        let checkboxHtml = '' +
            '<div class="container">' +
                '<label><input type="checkbox" class="ui-checkbox-input" value="NY" name="state1" />New York</label>' +
                '<label><input type="checkbox" class="ui-checkbox-input" value="' + selectValue + '" name="state2" />Maryland</label>' +
                '<label><input type="checkbox" class="ui-checkbox-input" value="DC" name="state3" />District of Columbia</label>' +
            '</div>';
        let wrapper = createHtmlElementFromString(checkboxHtml);
        fixture.appendChild(wrapper);
        let radios = wrapper.getElementsByTagName('input');
        let checkbox2 = wrapper.querySelector('input[value="' + selectValue + '"]');
        let checkbox1 = wrapper.querySelector('input[value="NY"]');
        let checkbox3 = wrapper.querySelector('input[value="DC"]');
        let instance = new Checkboxes({inputs: radios});
        QUnit.equal(checkbox2.checked, false);
        QUnit.equal(checkbox1.checked, false);
        QUnit.equal(checkbox3.checked, false);
        instance.setValue(selectValue);
        QUnit.equal(checkbox2.checked, true, 'correct radio button is selected after passing its matching value to setValue()');
        QUnit.equal(checkbox1.checked, false);
        QUnit.equal(checkbox3.checked, false);
        instance.destroy();
    });

    QUnit.test('should check all checkboxes that match the value of the options values passed in on initialize', function() {
        QUnit.expect(3);
        let val = 'NY';
        let checkboxHtml = '' +
            '<div class="container">' +
                '<label><input type="checkbox" value="MD" name="state2" />Maryland</label>' +
                '<label><input type="checkbox" value="' + val + '" name="state1" />New York</label>' +
                '<label><input type="checkbox" value="DC" name="state3" />District Of Columbia</label>' +
            '</div>';
        let wrapper = createHtmlElementFromString(checkboxHtml);
        let inputs = wrapper.getElementsByTagName('input');
        let instance = new Checkboxes({inputs: inputs, value: val});
        QUnit.equal(inputs[0].checked, false, 'first input\'s checked property returns false because its value doesnt match value passed in initialize options');
        QUnit.equal(inputs[1].checked, true, 'second input\'s checked property returns true initially because value was passed to options that matches it');
        QUnit.equal(inputs[2].checked, false, 'third input\'s checked property returns false because its value doesnt match value passed in initialize options');
        instance.destroy();
    });

    QUnit.test('should check all checkboxes that match the value of the options values passed in on initialize', function() {
        QUnit.expect(3);
        let val = 'NY';
        let val2 = 'MD';
        let checkboxHtml = '' +
            '<div class="container">' +
            '<label><input type="checkbox" value="' + val + '" name="state1" />New York</label>' +
            '<label><input type="checkbox" value="' + val2 + '" name="state2" />Maryland</label>' +
            '<label><input type="checkbox" value="DC" name="state3" />District Of Columbia</label>' +
            '</div>';
        let wrapper = createHtmlElementFromString(checkboxHtml);
        let inputs = wrapper.getElementsByTagName('input');
        let instance = new Checkboxes({inputs: inputs, value: [val, val2]});
        QUnit.equal(inputs[0].checked, true, 'first input\'s checked property returns true initially because value was passed to options that matches it');
        QUnit.equal(inputs[1].checked, true, 'second input\'s checked property returns true initially because value was passed to options that matches it');
        QUnit.equal(inputs[2].checked, false, 'third input\'s checked property returns false because its value doesnt match value passed in initialize options');
        instance.destroy();
    });

    QUnit.test('clicking on UI elements should apply the appropriate active classes', function() {
        QUnit.expect(8);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = createHtmlElementFromString(checkboxHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-checkbox-input');
        let instance = new Checkboxes({inputs: inputs});
        let UIElements = wrapper.getElementsByClassName('ui-checkbox');
        // click first input
        UIElements[0].click();
        QUnit.ok(UIElements[0].classList.contains(selectedClass), 'first input ui element contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second input ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third input ui element does NOT contain active class');
        // click first input again
        UIElements[0].click();
        QUnit.ok(!UIElements[0].classList.contains(selectedClass), 'first input ui element no longer contains active class');
        QUnit.ok(!UIElements[1].classList.contains(selectedClass), 'second input ui element does NOT contain active class');
        QUnit.ok(!UIElements[2].classList.contains(selectedClass), 'third input ui element does NOT contain active class');
        // click second input
        UIElements[1].click();
        QUnit.ok(UIElements[1].classList.contains(selectedClass), 'second input ui element now contains active class');
        // click third input
        UIElements[2].click();
        QUnit.ok(UIElements[2].classList.contains(selectedClass), 'third input ui element now contains active class');
        instance.destroy();
    });

    QUnit.test('clicking on UI elements should trigger onChange callback option', function() {
        QUnit.expect(4);
        let fixture = document.getElementById('qunit-fixture');
        let wrapper = createHtmlElementFromString(checkboxHtml);
        fixture.appendChild(wrapper);
        let inputs = wrapper.getElementsByClassName('ui-checkbox-input');
        let onChangeSpy = sinon.spy();
        let instance = new Checkboxes({inputs: inputs, onChange: onChangeSpy});
        let UIElements = wrapper.getElementsByClassName('ui-checkbox');
        // click first input
        UIElements[0].click();
        QUnit.deepEqual(onChangeSpy.args[0], [inputs[0].value, inputs[0], UIElements[0]], 'clicking on first input input fires onChange callback with correct args');
        // click first input again
        UIElements[0].click();
        QUnit.deepEqual(onChangeSpy.args[1], [inputs[0].value, inputs[0], UIElements[0]], 'clicking on first input input again fires onChange callback again with correct args');
        // click second input
        UIElements[1].click();
        QUnit.deepEqual(onChangeSpy.args[2], [inputs[1].value, inputs[1], UIElements[1]], 'clicking on second input input fires onChange callback with correct args');
        // click third input
        UIElements[2].click();
        QUnit.deepEqual(onChangeSpy.args[3], [inputs[2].value, inputs[2], UIElements[2]], 'clicking on third input input fires onChange callback with correct args');
        instance.destroy();
    });

})();
