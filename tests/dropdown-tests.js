"use strict";
var Sinon = require('sinon');
var QUnit = require('qunit');
var Dropdown = require('../src/dropdown');
var TestUtils = require('test-utils');

module.exports = (function (){

    QUnit.module('Dropdown Tests');

    var html =
        '<select>' +
            '<option value="AAPL">Apple</option>' +
            '<option value="FB">Facebook</option>' +
            '<option value="GOOG">Google</option>' +
        '</select>';

    QUnit.test('initialize, setup, and destruction', function() {
        QUnit.expect(5);
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiContainerClass = 'my-ui-container';
        var uiOptionsContainerClass = 'my-options-container';
        var uiOptionsClass = 'my-option';
        var uiSelectedValueContainerClass = 'my-selected-val-container';
        var originalDisplayType = 'inline-block';
        selectEl.style.display = originalDisplayType; // set to inline block to test if put back on destroy
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsContainerClass: uiOptionsContainerClass,
            optionsClass: uiOptionsClass,
            selectedValueContainerClass: uiSelectedValueContainerClass
        });
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        QUnit.equal(selectEl.nextSibling, uiEl, 'ui element container html has been built and added as a sibling of the original form select element');
        QUnit.equal(uiEl.getElementsByClassName(uiSelectedValueContainerClass).length, 1, 'ui selected value container html was added as a child of the ui element container');
        var uiSelectedValueContainer = uiEl.getElementsByClassName(uiSelectedValueContainerClass)[0];
        QUnit.equal(uiSelectedValueContainer.getAttribute('data-value'), '', 'ui selected value container has no data-value initially');
        QUnit.equal(uiSelectedValueContainer.textContent, '', 'ui selected value container has no inner text content (display value) initially');
        dropdown.destroy();
        QUnit.equal(selectEl.nextSibling, fixture.getElementsByClassName(uiContainerClass)[0], 'after destroy(), ui element container html has been removed as a sibling of the original form select element');
    });

    QUnit.test('initializing when a dropdown item is pre-selected', function() {
        QUnit.expect(4);
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var formOptionEls = selectEl.getElementsByTagName('option');
        var uiContainerClass = 'my-ui-container';
        var uiOptionsContainerClass = 'my-options-container';
        var uiOptionsClass = 'my-option';
        var uiSelectedValueContainerClass = 'my-selected-val-container';
        var uiOptionsSelectedClass = 'my-option-selected';
        formOptionEls[1].setAttribute('selected', 'selected'); // set the second dropdown as selected
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsContainerClass: uiOptionsContainerClass,
            optionsClass: uiOptionsClass,
            selectedValueContainerClass: uiSelectedValueContainerClass,
            optionsSelectedClass: uiOptionsSelectedClass
        });
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        var uiSelectedValueContainerEl = uiEl.getElementsByClassName(uiSelectedValueContainerClass)[0];
        QUnit.ok(uiEl.getElementsByClassName(uiOptionsClass)[1].classList.contains(uiOptionsSelectedClass), 'on init, second ui option contains selected class since second item was pre-selected before instantiation');
        QUnit.ok(!uiEl.getElementsByClassName(uiOptionsClass)[0].classList.contains(uiOptionsSelectedClass), 'first ui option does not contain selected class');
        QUnit.ok(!uiEl.getElementsByClassName(uiOptionsClass)[2].classList.contains(uiOptionsSelectedClass), 'third ui option does not contain selected class');
        QUnit.equal(uiSelectedValueContainerEl.getAttribute('data-value'), formOptionEls[1].value, 'ui selected value container data value has been updated to second options value');
        dropdown.destroy();
    });

    QUnit.test('clicking through ui dropdown selections', function() {
        QUnit.expect(5);
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var formOptionEls = selectEl.getElementsByTagName('option');
        var uiContainerClass = 'my-ui-container';
        var uiOptionsContainerClass = 'my-options-container';
        var uiOptionsClass = 'my-option';
        var uiSelectedValueContainerClass = 'my-selected-val-container';
        var uiOptionsContainerActiveClass = 'active-options-container';
        var onChangeSpy = Sinon.spy();
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsContainerClass: uiOptionsContainerClass,
            optionsContainerActiveClass: uiOptionsContainerActiveClass,
            optionsClass: uiOptionsClass,
            selectedValueContainerClass: uiSelectedValueContainerClass,
            onChange: onChangeSpy
        });
        var selectChangeSpy = Sinon.spy();
        selectEl.onchange = selectChangeSpy;
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        var uiOptionsContainerEl = uiEl.getElementsByClassName(uiOptionsContainerClass)[0];
        var uiOptionEls = uiOptionsContainerEl.getElementsByClassName(uiOptionsClass);
        var uiSelectedValueContainerEl = uiEl.getElementsByClassName(uiSelectedValueContainerClass)[0];
        QUnit.ok(!uiEl.classList.contains(uiOptionsContainerActiveClass), 'on initialize, options container element does NOT have active class');
        // click on selected value container to show options
        uiSelectedValueContainerEl.dispatchEvent(TestUtils.createEvent('click'));
        QUnit.ok(uiEl.classList.contains(uiOptionsContainerActiveClass), 'after clicking on selected value container element, options container now has active class');
        // click on second option element
        uiOptionEls[1].dispatchEvent(TestUtils.createEvent('click'));
        QUnit.equal(dropdown.getValue(), formOptionEls[1].value, 'after clicking on second item, getValue() returns data value of second item correctly');
        QUnit.equal(uiSelectedValueContainerEl.getAttribute('data-value'), formOptionEls[1].value, 'selected value container reflects the second item data value');
        QUnit.deepEqual(onChangeSpy.args[0], [formOptionEls[1].value, selectEl, uiEl, selectChangeSpy.args[0][0]], 'onChange callback was fired with correct args');
        dropdown.destroy();
    });

    QUnit.test('get option element by its data and display value', function() {
        QUnit.expect(2);
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var options = selectEl.getElementsByTagName('option');
        var dropdown = new Dropdown({el: selectEl});
        QUnit.equal(dropdown.getOptionByDisplayValue(options[1].innerHTML), options[1], 'calling getOptionByDisplayValue() with second items display value returns the second item option el');
        QUnit.equal(dropdown.getOptionByDataValue(options[1].value), options[1], 'calling getOptionByDataValue() with second items display value returns the second item option el');
        dropdown.destroy();
    });

    QUnit.test('enabling and disabling dropdown', function() {
        QUnit.expect(18);
        // need the first item to be blank or browser will automatically select the first item
        var html = '<select>' +
            '<option value=""></option>' +
            '<option value="AAPL">Apple</option>' +
            '<option value="FB">Facebook</option>' +
            '<option value="GOOG">Google</option>' +
        '</select>';
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var formOptionEls = selectEl.getElementsByTagName('option');
        var uiContainerClass = 'my-ui-container';
        var uiOptionsContainerClass = 'my-options-container';
        var uiOptionsClass = 'my-option';
        var uiSelectedValueContainerClass = 'my-selected-val-container';
        var uiOptionsContainerActiveClass = 'active-options-container';
        var uiDisabledClass = 'ui-disabled';
        var uiOptionsSelectedClass = 'option-selected';
        var onChangeSpy = Sinon.spy();
        selectEl.disabled = true; // pre-disable
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsContainerClass: uiOptionsContainerClass,
            optionsContainerActiveClass: uiOptionsContainerActiveClass,
            optionsClass: uiOptionsClass,
            optionsSelectedClass: uiOptionsSelectedClass,
            selectedValueContainerClass: uiSelectedValueContainerClass,
            onChange: onChangeSpy,
            disabledClass: uiDisabledClass
        });
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        var uiOptionsContainerEl = uiEl.getElementsByClassName(uiOptionsContainerClass)[0];
        var uiOptionEls = uiOptionsContainerEl.getElementsByClassName(uiOptionsClass);
        var uiSelectedValueContainerEl = uiEl.getElementsByClassName(uiSelectedValueContainerClass)[0];

        QUnit.ok(uiEl.classList.contains(uiDisabledClass), 'on initialize, ui element has disabled class because select element was disabled upon instantiation');
        QUnit.equal(selectEl.value, '', 'select element data value is empty');
        QUnit.equal(uiSelectedValueContainerEl.getAttribute('data-value'), '', 'ui element selected container data value is empty');
        QUnit.equal(uiSelectedValueContainerEl.innerHTML, '', 'ui element selected container display value is empty');
        QUnit.equal(uiOptionsContainerEl.getElementsByClassName(uiOptionsSelectedClass).length, 0, 'there are no selected ui option elements');
        dropdown.enable();
        QUnit.ok(!uiEl.classList.contains(uiDisabledClass), 'after enable(), ui element has disabled class has been removed');
        QUnit.ok(!selectEl.disabled, 'select element disabled property returns false');
        dropdown.disable();
        var testOption = formOptionEls[1];
        dropdown.setValue(testOption.value);
        QUnit.equal(selectEl.value, '', 'when calling setValue() when the dropdown is disabled, select element data value did not change');
        QUnit.equal(uiSelectedValueContainerEl.getAttribute('data-value'), '', 'ui element selected container data value is empty');
        QUnit.equal(uiSelectedValueContainerEl.innerHTML, '', 'ui element selected container display value is empty');
        QUnit.equal(uiOptionsContainerEl.getElementsByClassName(uiOptionsSelectedClass).length, 0, 'there are no selected ui option elements');
        QUnit.equal(onChangeSpy.callCount, 0, 'onChange callback did NOT fire');
        // click on selected value container to show options
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('click', false, false, null);
        uiSelectedValueContainerEl.dispatchEvent(event);
        QUnit.ok(uiEl.classList.contains(uiOptionsContainerActiveClass), 'after clicking on selected value container element, options container does NOT have active class');
        // click on second option element
        var event = document.createEvent('CustomEvent');
        event.initCustomEvent('click', false, false, null);
        uiOptionEls[1].dispatchEvent(event);
        QUnit.equal(selectEl.value, '', 'when clicking on an option while the dropdown is disabled, select element data value still did not change');
        QUnit.equal(uiSelectedValueContainerEl.getAttribute('data-value'), '', 'ui element selected container data value is still empty');
        QUnit.equal(uiSelectedValueContainerEl.innerHTML, '', 'ui element selected container display value is still empty');
        QUnit.equal(uiOptionsContainerEl.getElementsByClassName(uiOptionsSelectedClass).length, 0, 'there are still no selected ui option elements');
        QUnit.equal(onChangeSpy.callCount, 0, 'onChange callback did NOT fire');
        dropdown.destroy();
    });

    QUnit.test('new value changed on select dropdown updates its ui counterpart', function() {
        QUnit.expect(2);
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var formOptionEls = selectEl.getElementsByTagName('option');
        var dropdown = new Dropdown({
            el: selectEl
        });
        var valueContainer = fixture.getElementsByClassName('dropdown-value-container')[0];
        QUnit.equal(valueContainer.getAttribute('data-value'), '', 'when change event is triggered with a new value on select element, ui element is updated');
        // trigger change event and set to second items value
        selectEl.value = formOptionEls[1].value;
        selectEl.dispatchEvent(TestUtils.createEvent('change'));
        QUnit.equal(valueContainer.getAttribute('data-value'), formOptionEls[1].value, 'when change event is triggered with a new value on select element, ui element is updated');
        dropdown.destroy();
    });

    QUnit.test('clicking a ui dropdown selection should remove active class from dropdown container element', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiContainerClass = 'my-ui-container';
        var uiOptionsContainerClass = 'my-options-container';
        var uiOptionsClass = 'my-option';
        var uiSelectedValueContainerClass = 'my-selected-val-container';
        var uiOptionsContainerActiveClass = 'active-options-container';
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsContainerClass: uiOptionsContainerClass,
            optionsClass: uiOptionsClass,
            optionsContainerActiveClass: uiOptionsContainerActiveClass,
            selectedValueContainerClass: uiSelectedValueContainerClass
        });
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        var uiOptionEls = uiEl.getElementsByClassName(uiOptionsClass);
        var uiSelectedValueContainerEl = uiEl.getElementsByClassName(uiSelectedValueContainerClass)[0];
        // click on selected value container to show options
        uiSelectedValueContainerEl.dispatchEvent(TestUtils.createEvent('click'));
        // click on second option element
        uiOptionEls[1].dispatchEvent(TestUtils.createEvent('click'));
        QUnit.ok(!uiEl.classList.contains(uiOptionsContainerActiveClass), 'after clicking on an option ui item, dropdown container no longer has active class');
        dropdown.destroy();
    });


})();