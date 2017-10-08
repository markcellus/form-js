import sinon from 'sinon';
import QUnit from 'qunit';
import {createHtmlElementFromString, createEvent} from '../utils/element';
import Checkbox from '../src/checkbox';

module.exports = (function () {

    QUnit.module('Checkbox');

    let html = '<label><input type="checkbox" class="ui-checkbox-input" value="NY" name="ny" /> New York</label>';
    let disabledClass = 'ui-checkbox-disabled';

    QUnit.test('initializing/destroying the checkbox', function() {
        QUnit.expect(2);
        let fixture = document.getElementById('qunit-fixture');
        let container = createHtmlElementFromString(html);
        fixture.appendChild(container);
        let input = container.getElementsByClassName('ui-checkbox-input')[0];
        let checkbox = new Checkbox({el: input});
        let checkboxContainer = container.getElementsByClassName('ui-checkbox')[0];
        QUnit.ok(checkboxContainer.childNodes[0].isEqualNode(input), 'ui checkbox container was created with input element as its nested child');
        checkbox.destroy();
        QUnit.equal(input.parentNode, container, 'after destroy, input element\'s parent node is back to original');
    });

    QUnit.test('checking/unchecking checkbox', function() {
        QUnit.expect(6);
        let fixture = document.getElementById('qunit-fixture');
        let container = createHtmlElementFromString(html);
        fixture.appendChild(container);
        let input = container.getElementsByClassName('ui-checkbox-input')[0];
        let checkbox = new Checkbox({el: input});
        let checkboxContainer = container.getElementsByClassName('ui-checkbox')[0];
        QUnit.ok(!checkboxContainer.classList.contains('ui-checkbox-checked'), 'checkbox does not have active class initially');
        QUnit.ok(!input.checked, 'input\'s checked boolean returns falsy');
        checkbox.check();
        QUnit.ok(checkboxContainer.classList.contains('ui-checkbox-checked'), 'checkbox has correct active class after check()');
        QUnit.ok(input.checked, 'input\'s checked boolean returns truthy');
        checkbox.uncheck();
        QUnit.ok(!checkboxContainer.classList.contains('ui-checkbox-checked'), 'after uncheck() checkbox does not have active class');
        QUnit.ok(!input.checked, 'input\'s checked boolean returns falsy');
        checkbox.destroy();
    });

    QUnit.test('initializing/destroying when checked initially', function() {
        QUnit.expect(4);
        let container = createHtmlElementFromString(html);
        document.getElementById('qunit-fixture').appendChild(container);
        let input = container.getElementsByClassName('ui-checkbox-input')[0];
        input.setAttribute('checked', 'checked'); // make it so that input is checked initially
        let checkbox = new Checkbox({el: input});
        let checkboxContainer = container.getElementsByClassName('ui-checkbox')[0];
        QUnit.equal(input.checked, true, 'input was checked initially');
        QUnit.ok(checkboxContainer.classList.contains('ui-checkbox-checked'), 'checkbox has active class initially because original input was checked initially');
        checkbox.uncheck();
        QUnit.equal(input.checked, false, 'input checked boolean returns false');
        checkbox.destroy();
        QUnit.ok(input.checked, 'input checked boolean returns true because that\'s how it was initially');
    });

    QUnit.test('should trigger onChecked callback option with correct args when checked', function() {
        QUnit.expect(2);
        let fixture = document.getElementById('qunit-fixture');
        let container = createHtmlElementFromString(html);
        fixture.appendChild(container);
        let input = container.getElementsByClassName('ui-checkbox-input')[0];
        let onCheckedSpy = sinon.spy();
        let checkbox = new Checkbox({el: input, onChecked: onCheckedSpy});
        let UICheckbox = container.getElementsByClassName('ui-checkbox')[0];
        checkbox.check();
        QUnit.deepEqual(onCheckedSpy.args[0], ['NY', input, UICheckbox], 'on check(), onChecked callback was fired with correct args');
        checkbox.uncheck();
        QUnit.equal(onCheckedSpy.callCount, 1, 'onChecked callback was NOT fired');
        checkbox.destroy();
    });

    QUnit.test('should trigger onUnchecked callback option with empty string and correct args when unchecked', function() {
        QUnit.expect(1);
        let fixture = document.getElementById('qunit-fixture');
        let container = createHtmlElementFromString(html);
        fixture.appendChild(container);
        let input = container.getElementsByClassName('ui-checkbox-input')[0];
        let onUncheckedSpy = sinon.spy();
        let checkbox = new Checkbox({el: input, onUnchecked: onUncheckedSpy});
        let UICheckbox = container.getElementsByClassName('ui-checkbox')[0];
        checkbox.check();
        checkbox.uncheck();
        QUnit.deepEqual(onUncheckedSpy.args[0], ['', input, UICheckbox], 'on uncheck(), onUnchecked callback was fired with correct args');
        checkbox.destroy();
    });

    QUnit.test('clicking on and off ui element', function () {
       QUnit.expect(12);
       let fixture = document.getElementById('qunit-fixture');
       let container = createHtmlElementFromString(html);
       fixture.appendChild(container);
       let input = container.getElementsByClassName('ui-checkbox-input')[0];
       let checkSpy = sinon.spy(Checkbox.prototype, 'check');
       let uncheckSpy = sinon.spy(Checkbox.prototype, 'uncheck');
       let instance = new Checkbox({el: input});
       let checkboxUIEl = container.getElementsByClassName('ui-checkbox')[0];
       QUnit.equal(checkSpy.callCount, 0, 'check() method was not called initially');
       QUnit.equal(uncheckSpy.callCount, 0, 'uncheck() method was not called initially');
       QUnit.equal(input.checked, false, 'input checked boolean returns false');
       checkboxUIEl.dispatchEvent(createEvent('click'));
       QUnit.equal(checkSpy.callCount, 1, 'clicking checkbox element calls check() method');
       QUnit.equal(uncheckSpy.callCount, 0, 'uncheck() method was not called');
       QUnit.equal(input.checked, true, 'input checked boolean returns true');
       checkboxUIEl.dispatchEvent(createEvent('click'));
       QUnit.equal(uncheckSpy.callCount, 1, 'clicking checkbox element a second time calls uncheck() method');
       QUnit.equal(checkSpy.callCount, 1, 'check() method was not called');
       QUnit.equal(input.checked, false, 'input checked boolean returns false');
       instance.destroy();
       checkboxUIEl.dispatchEvent(createEvent('click'));
       QUnit.equal(checkSpy.callCount, 1, 'clicking checkbox element again does NOT call check() method because instance was destroyed');
       QUnit.equal(uncheckSpy.callCount, 1, 'uncheck() method was not called');
       QUnit.equal(input.checked, false, 'input checked boolean returns false');
       checkSpy.restore();
       uncheckSpy.restore();
    });

    QUnit.test('clicking on and off input\'s label', function () {
        let html = '<div><label for="inp" class="checkbox-label"></label><input type="checkbox" id="inp" class="ui-checkbox-input" value="NY" name="ny" /> New York</div>';
        QUnit.expect(11);
        let fixture = document.getElementById('qunit-fixture');
        let container = createHtmlElementFromString(html);
        fixture.appendChild(container);
        let input = container.getElementsByClassName('ui-checkbox-input')[0];
        let checkSpy = sinon.spy(Checkbox.prototype, 'check');
        let uncheckSpy = sinon.spy(Checkbox.prototype, 'uncheck');
        let instance = new Checkbox({el: input});
        let label = container.getElementsByClassName('checkbox-label')[0];
        QUnit.equal(checkSpy.callCount, 0, 'check() method was not called initially');
        QUnit.equal(uncheckSpy.callCount, 0, 'uncheck() method was not called initially');
        QUnit.equal(input.checked, false, 'input checked boolean returns false');
        label.dispatchEvent(createEvent('click'));
        QUnit.equal(checkSpy.callCount, 1, 'clicking checkbox element calls check() method');
        QUnit.equal(uncheckSpy.callCount, 0, 'uncheck() method was not called');
        QUnit.equal(input.checked, true, 'input checked boolean returns true');
        label.dispatchEvent(createEvent('click'));
        QUnit.equal(uncheckSpy.callCount, 1, 'clicking checkbox element a second time calls uncheck() method');
        QUnit.equal(checkSpy.callCount, 1, 'check() method was not called');
        QUnit.equal(input.checked, false, 'input checked boolean returns false');
        instance.destroy();
        label.dispatchEvent(createEvent('click'));
        QUnit.equal(checkSpy.callCount, 1, 'clicking checkbox element again does NOT call check() method because instance was destroyed');
        QUnit.equal(uncheckSpy.callCount, 1, 'uncheck() method was not called');
        checkSpy.restore();
        uncheckSpy.restore();
    });

    QUnit.test('clicking on and off when disabled', function () {
       QUnit.expect(5);
       let fixture = document.getElementById('qunit-fixture');
       let container = createHtmlElementFromString(html);
       fixture.appendChild(container);
       let input = container.getElementsByClassName('ui-checkbox-input')[0];
       let checkSpy = sinon.spy(Checkbox.prototype, 'check');
       let uncheckSpy = sinon.spy(Checkbox.prototype, 'uncheck');
       let instance = new Checkbox({el: input});
       let checkboxEl = container.getElementsByClassName('ui-checkbox')[0];
       instance.disable(); //disable
       checkboxEl.dispatchEvent(createEvent('click'));
       QUnit.equal(checkSpy.callCount, 0, 'clicking checkbox element while its disabled does not call check() method');
       QUnit.equal(uncheckSpy.callCount, 0, 'clicking checkbox element while its disabled does not call uncheck() method');
       instance.enable();
       checkboxEl.dispatchEvent(createEvent('click'));
       QUnit.equal(checkSpy.callCount, 1, 'after enabling, clicking checkbox element calls check() method');
       checkboxEl.dispatchEvent(createEvent('click'));
       QUnit.equal(uncheckSpy.callCount, 1, 'clicking checkbox element a second time calls uncheck() method');
       QUnit.equal(checkSpy.callCount, 1, 'check() method was not called');
       instance.destroy();
       checkSpy.restore();
       uncheckSpy.restore();
    });

    QUnit.test('enabling and disabling', function () {
        QUnit.expect(6);
        let fixture = document.getElementById('qunit-fixture');
        let container = createHtmlElementFromString(html);
        fixture.appendChild(container);
        let inputEl = container.getElementsByClassName('ui-checkbox-input')[0];
        let instance = new Checkbox({el: inputEl});
        let checkboxEl = container.getElementsByClassName('ui-checkbox')[0];
        QUnit.ok(!checkboxEl.classList.contains(disabledClass), 'checkbox element does not have active class initially');
        QUnit.ok(!inputEl.disabled, 'input\'s checked boolean returns falsy');
        instance.disable();
        QUnit.ok(checkboxEl.classList.contains(disabledClass), 'checkbox element has correct disabled class after disable()');
        QUnit.ok(inputEl.disabled, 'input\'s checked boolean returns truthy');
        instance.enable();
        QUnit.ok(!checkboxEl.classList.contains(disabledClass), 'after enable(), checkbox element does not have disabled class');
        QUnit.ok(!inputEl.disabled, 'input\'s checked boolean returns falsy');
        instance.destroy();
    });

    QUnit.test('initializing and destroying when disabled state already exists', function () {
        QUnit.expect(5);
        let container = createHtmlElementFromString(html);
        document.getElementById('qunit-fixture').appendChild(container);
        let inputEl = container.getElementsByClassName('ui-checkbox-input')[0];
        inputEl.setAttribute('disabled', 'disabled'); // make it so that input is checked initially
        let setAttrSpy = sinon.spy(inputEl, 'setAttribute');
        let instance = new Checkbox({el: inputEl});
        let checkboxEl = container.getElementsByClassName('ui-checkbox')[0];
        QUnit.ok(inputEl.disabled, 'input was disabled initially');
        QUnit.ok(checkboxEl.classList.contains(disabledClass), 'checkbox element has disabled class initially because original input was disabled initially');
        QUnit.equal(setAttrSpy.callCount, 0, 'setAttribute was NOT called to ensure no unnecessary change events are fired');
        instance.enable();
        QUnit.ok(!checkboxEl.classList.contains(disabledClass), 'when enabling, checkbox element\'s disabled class is removed');
        instance.destroy();
        QUnit.ok(inputEl.disabled, 'input disabled boolean returns true because that\'s how it was initially');
        setAttrSpy.restore();
    });

    QUnit.test('should set the value passed to setValue() onto the checkbox form element', function() {
        QUnit.expect(1);
        let fixture = document.getElementById('qunit-fixture');
        let container = createHtmlElementFromString(html);
        fixture.appendChild(container);
        let checkboxEl = container.getElementsByClassName('ui-checkbox-input')[0];
        let checkbox = new Checkbox({el: checkboxEl});
        let testVal = 'blah';
        checkbox.setValue(testVal);
        QUnit.equal(checkboxEl.value, testVal);
        checkbox.destroy();
    });

    QUnit.test('getValue() should return value of the checkbox when checked', function() {
        QUnit.expect(1);
        let fixture = document.getElementById('qunit-fixture');
        let container = createHtmlElementFromString(html);
        fixture.appendChild(container);
        let checkbox = new Checkbox({el: container.getElementsByClassName('ui-checkbox-input')[0]});
        checkbox.check();
        QUnit.equal(checkbox.getValue(), 'NY');
        checkbox.destroy();
    });

    QUnit.test('getValue() should return empty string when unchecked', function() {
        QUnit.expect(1);
        let fixture = document.getElementById('qunit-fixture');
        let container = createHtmlElementFromString(html);
        fixture.appendChild(container);
        let checkbox = new Checkbox({el: container.getElementsByClassName('ui-checkbox-input')[0]});
        checkbox.check();
        checkbox.uncheck();
        QUnit.equal(checkbox.getValue(), '');
        checkbox.destroy();
    });

    QUnit.test('should be checked if options value passed is true', function() {
        QUnit.expect(1);
        let container = createHtmlElementFromString(html);
        document.getElementById('qunit-fixture').appendChild(container);
        let input = container.getElementsByClassName('ui-checkbox-input')[0];
        let checkbox = new Checkbox({el: input, value: true});
        QUnit.equal(input.checked, true);
        checkbox.destroy();
    });

    QUnit.test('should not be checked if options value passed is false', function() {
        QUnit.expect(1);
        let container = createHtmlElementFromString(html);
        document.getElementById('qunit-fixture').appendChild(container);
        let input = container.getElementsByClassName('ui-checkbox-input')[0];
        let checkbox = new Checkbox({el: input, value: false});
        QUnit.equal(input.checked, false);
        checkbox.destroy();
    });

    QUnit.test('clear() should uncheck checkbox', function() {
        QUnit.expect(2);
        let container = createHtmlElementFromString(html);
        document.getElementById('qunit-fixture').appendChild(container);
        let input = container.getElementsByClassName('ui-checkbox-input')[0];
        let checkbox = new Checkbox({el: input});
        checkbox.check();
        QUnit.equal(input.checked, true, 'checked initially');
        checkbox.clear();
        QUnit.equal(input.checked, false, 'not checked after clear()');
        checkbox.destroy();
    });

    QUnit.test('clicking on ui element should trigger onChange callback option with correct args', function() {
        QUnit.expect(3);
        let fixture = document.getElementById('qunit-fixture');
        let container = createHtmlElementFromString(html);
        fixture.appendChild(container);
        let input = container.getElementsByClassName('ui-checkbox-input')[0];
        let onChangeSpy = sinon.spy();
        let checkbox = new Checkbox({el: input, onChange: onChangeSpy});
        let UICheckbox = container.getElementsByClassName('ui-checkbox')[0];
        QUnit.equal(onChangeSpy.callCount, 0);
        UICheckbox.click();
        QUnit.deepEqual(onChangeSpy.args[0], [true, input, UICheckbox], 'onChange was called with truth value when clicked to check');
        UICheckbox.click();
        QUnit.deepEqual(onChangeSpy.args[1], [false, input, UICheckbox], 'onChange was called with false value when clicked to uncheck');
        checkbox.destroy();
    });

    QUnit.test('clicking on input checkbox element should trigger onChange callback option with correct args', function() {
        QUnit.expect(3);
        let fixture = document.getElementById('qunit-fixture');
        let container = createHtmlElementFromString(html);
        fixture.appendChild(container);
        let input = container.getElementsByClassName('ui-checkbox-input')[0];
        let onChangeSpy = sinon.spy();
        let checkbox = new Checkbox({el: input, onChange: onChangeSpy});
        let UICheckbox = container.getElementsByClassName('ui-checkbox')[0];
        QUnit.equal(onChangeSpy.callCount, 0);
        input.click();
        QUnit.deepEqual(onChangeSpy.args[0], [true, input, UICheckbox], 'onChange was called with truth value when clicked to check');
        input.click();
        QUnit.deepEqual(onChangeSpy.args[1], [false, input, UICheckbox], 'onChange was called with false value when clicked to uncheck');
        checkbox.destroy();
    });

})();
