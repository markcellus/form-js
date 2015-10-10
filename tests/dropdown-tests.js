"use strict";
var Sinon = require('sinon');
var QUnit = require('qunit');
var Dropdown = require('../src/dropdown');
var TestUtils = require('test-utils');
var DeviceManager = require('device-manager');

module.exports = (function (){

    var deviceManagerIsMobileStub, redrawOptionsContainerStub;

    QUnit.module('Dropdown', {

        setup: function () {
            deviceManagerIsMobileStub = Sinon.stub(DeviceManager, 'isMobile');
            redrawOptionsContainerStub = Sinon.stub(Dropdown.prototype, 'redrawOptionsContainer');
            // be default assume desktop
            deviceManagerIsMobileStub.returns(false);
        },

        teardown: function () {
            redrawOptionsContainerStub.restore();
            deviceManagerIsMobileStub.restore();
        }
    });


    var html =
        '<select>' +
            '<option value="AAPL">Apple</option>' +
            '<option value="FB">Facebook</option>' +
            '<option value="GOOG">Google</option>' +
        '</select>';

    QUnit.test('initialize, setup, and destruction', function() {
        QUnit.expect(6);
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiContainerClass = 'my-ui-container';
        var uiOptionsContainerClass = 'my-options-container';
        var uiOptionsClass = 'my-option';
        var uiSelectedValueContainerClass = 'my-selected-val-container';
        var originalDisplayType = 'inline-block';
        selectEl.style.display = originalDisplayType; // set to inline block to test if put back on destroy
        var customWrapperClass = 'my-wrapper';
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsContainerClass: uiOptionsContainerClass,
            optionsClass: uiOptionsClass,
            selectedValueContainerClass: uiSelectedValueContainerClass,
            customWrapperClass: customWrapperClass
        });
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        QUnit.equal(selectEl.nextSibling, uiEl, 'ui element container html has been built and added as a sibling of the original form select element');
        QUnit.ok(fixture.getElementsByClassName(customWrapperClass)[0].contains(selectEl), 'a wrapper was added as the parent element of the select form element');
        QUnit.equal(uiEl.getElementsByClassName(uiSelectedValueContainerClass).length, 1, 'ui selected value container html was added as a child of the ui element container');
        var uiSelectedValueContainer = uiEl.getElementsByClassName(uiSelectedValueContainerClass)[0];
        QUnit.equal(uiSelectedValueContainer.getAttribute('data-value'), '', 'ui selected value container has no data-value initially');
        QUnit.equal(uiSelectedValueContainer.textContent, '', 'ui selected value container has no inner text content (display value) initially');
        dropdown.destroy();
        QUnit.equal(fixture.childNodes[0], selectEl, 'after destroy(), wrapper class been removed and form element was placed back as a child node of original parent');
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

    QUnit.test('get ui option element by its data', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var options = selectEl.getElementsByTagName('option');
        var optionsClass = 'my-opt';
        var dropdown = new Dropdown({el: selectEl, optionsClass: optionsClass});
        var uiOptions = dropdown.getUIElement().getElementsByClassName(optionsClass);
        QUnit.equal(dropdown.getUIOptionByDataValue(options[1].value), uiOptions[1], 'getUIOptionByDataValue() with second items data value returns the second ui option el');
        dropdown.destroy();
    });

    QUnit.test('disabled class should be applied to ui element when initialized with a select that is disabled', function() {
        QUnit.expect(1);
        // need the first item to be blank or browser will automatically select the first item
        var html = '<select disabled>' +
            '<option value=""></option>' +
            '<option value="AAPL">Apple</option>' +
            '<option value="FB">Facebook</option>' +
            '<option value="GOOG">Google</option>' +
            '</select>';
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiContainerClass = 'my-ui-container';
        var uiDisabledClass = 'ui-disabled';
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            disabledClass: uiDisabledClass
        });
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        QUnit.ok(uiEl.classList.contains(uiDisabledClass), 'on initialize, ui element has disabled class because select element was disabled upon instantiation');
        dropdown.destroy();
    });

    QUnit.test('disabled classes should be applied when disable() is called', function() {
        QUnit.expect(1);
        // need the first item to be blank or browser will automatically select the first item
        var html = '<select>' +
            '<option value=""></option>' +
            '</select>';
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiContainerClass = 'my-ui-container';
        var uiDisabledClass = 'ui-disabled';
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            disabledClass: uiDisabledClass
        });
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        dropdown.disable();
        QUnit.ok(uiEl.classList.contains(uiDisabledClass), 'after disable() call, ui element has disabled class');
        dropdown.destroy();
    });

    QUnit.test('clicking on ui element after disable() call should not apply active class to ui options container', function() {
        QUnit.expect(1);
        // need the first item to be blank or browser will automatically select the first item
        var html = '<select>' +
            '<option value=""></option>' +
            '</select>';
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiContainerClass = 'my-ui-container';
        var uiSelectedValueContainerClass = 'my-selected-val-container';
        var uiOptionsContainerActiveClass = 'active-options-container';
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsContainerActiveClass: uiOptionsContainerActiveClass,
            selectedValueContainerClass: uiSelectedValueContainerClass
        });
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        var uiSelectedValueContainerEl = uiEl.getElementsByClassName(uiSelectedValueContainerClass)[0];
        dropdown.disable();
        uiSelectedValueContainerEl.dispatchEvent(TestUtils.createEvent('click'));
        QUnit.ok(!uiEl.classList.contains(uiOptionsContainerActiveClass), 'after clicking on selected value container element while disabled, active class is not applied to ui element');
        dropdown.destroy();
    });

    QUnit.test('disabled classes should be removed when enabled() is called after disabling', function() {
        QUnit.expect(2);
        // need the first item to be blank or browser will automatically select the first item
        var html = '<select>' +
            '<option value=""></option>' +
            '</select>';
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiContainerClass = 'my-ui-container';
        var uiDisabledClass = 'ui-disabled';
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            disabledClass: uiDisabledClass
        });
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        dropdown.disable();
        dropdown.enable();
        QUnit.ok(!uiEl.classList.contains(uiDisabledClass), 'after enable(), ui element has disabled class has been removed');
        QUnit.ok(!selectEl.disabled, 'select element disabled property returns false');
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

    QUnit.test('ui selected display value is set to selected option\'s display value when initializing with the disabled select option with a selected option', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var testDisplayValue = 'My Placeholder';
        var html =
            '<select disabled>' +
                '<option value="" selected>' + testDisplayValue + '</option>' +
            '</select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var formOption = selectEl.getElementsByTagName('option')[0];
        formOption.setAttribute('selected', 'selected'); // set the second dropdown as selected
        var uiSelectedValueContainerClass = 'my-selected-val-container';
        var dropdown = new Dropdown({el: selectEl, selectedValueContainerClass: uiSelectedValueContainerClass});
        var uiSelectedValueContainerEl = fixture.getElementsByClassName(uiSelectedValueContainerClass)[0];
        QUnit.equal(uiSelectedValueContainerEl.textContent, testDisplayValue, 'ui selected display value container display value was set to the selected options display value');
        dropdown.destroy();
    });

    QUnit.test('clicking anywhere outside the ui element when its ui options container element is open should hide the ui options container element', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiContainerClass = 'my-ui-container';
        var uiOptionsContainerActiveClass = 'active-options-container';
        var uiSelectedValueContainerClass = 'my-selected-val-container';
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsContainerActiveClass: uiOptionsContainerActiveClass,
            selectedValueContainerClass: uiSelectedValueContainerClass
        });
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        var uiSelectedValueContainerEl = uiEl.getElementsByClassName(uiSelectedValueContainerClass)[0];
        // click on selected value container to show options
        uiSelectedValueContainerEl.dispatchEvent(TestUtils.createEvent('click'));
        // click outside
        fixture.dispatchEvent(TestUtils.createEvent('click'));
        QUnit.ok(!uiEl.classList.contains(uiOptionsContainerActiveClass), 'since click was NOT in ui options container, ui options container element no longer has active class');
        dropdown.destroy();
    });

    QUnit.test('clicking on the ui element and anywhere inside of it while ui options container is open does NOT close ui options container', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiContainerClass = 'my-ui-container';
        var uiOptionsContainerActiveClass = 'active-options-container';
        var uiSelectedValueContainerClass = 'my-selected-val-container';
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsContainerActiveClass: uiOptionsContainerActiveClass,
            selectedValueContainerClass: uiSelectedValueContainerClass
        });
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        var uiSelectedValueContainerEl = uiEl.getElementsByClassName(uiSelectedValueContainerClass)[0];
        // click on selected value container to show options
        uiSelectedValueContainerEl.dispatchEvent(TestUtils.createEvent('click'));
        // click outside
        QUnit.ok(uiEl.classList.contains(uiOptionsContainerActiveClass), 'ui options container element still has active class after clicking anywhere inside of ui options container');
        dropdown.destroy();
    });

    QUnit.test('clicking on another ui dropdown element inside of the same form should hide the ui options container element', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var html =
            '<form>' +
                '<select>' +
                    '<option value="AAPL">Apple</option>' +
                    '<option value="FB">Facebook</option>' +
                    '<option value="GOOG">Google</option>' +
                '</select>' +
                '<select>' +
                    '<option value="Apple">Apple</option>' +
                    '<option value="Orange">Orange</option>' +
                '</select>' +
            '</form>';
        var formEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(formEl);
        var uiContainerClass = 'my-ui-container';
        var uiOptionsContainerActiveClass = 'active-options-container';
        var uiSelectedValueContainerClass = 'my-selected-val-container';
        var selectEls = formEl.getElementsByTagName('select');
        var firstDropdown = new Dropdown({
            el: selectEls[0],
            containerClass: uiContainerClass,
            optionsContainerActiveClass: uiOptionsContainerActiveClass,
            selectedValueContainerClass: uiSelectedValueContainerClass
        });
        var secondDropdown = new Dropdown({
            el: selectEls[1],
            containerClass: uiContainerClass,
            optionsContainerActiveClass: uiOptionsContainerActiveClass,
            selectedValueContainerClass: uiSelectedValueContainerClass
        });
        // click on selected value container of first element to show its options
        var firstUIElement = fixture.getElementsByClassName(uiContainerClass)[0];
        firstUIElement.getElementsByClassName(uiSelectedValueContainerClass)[0].dispatchEvent(TestUtils.createEvent('click'));
        // click on selected value container of second element to show its options
        var secondUIElement = fixture.getElementsByClassName(uiContainerClass)[1];
        secondUIElement.getElementsByClassName(uiSelectedValueContainerClass)[0].dispatchEvent(TestUtils.createEvent('click'));
        QUnit.ok(!firstUIElement.classList.contains(uiOptionsContainerActiveClass), 'clicking on second ui value container closes the first');
        firstDropdown.destroy();
        secondDropdown.destroy();
    });

    QUnit.test('updateOptions() should create new form and UI elements from objects in the array that it is passed', function() {
        QUnit.expect(4);
        var fixture = document.getElementById('qunit-fixture');
        var html =
            '<select>' +
                '<option value="AAPL">Apple</option>' +
                '<option value="FB">Facebook</option>' +
                '<option value="GOOG">Google</option>' +
            '</select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiContainerClass = 'my-ui-container';
        var uiOptionsClass = 'my-option';
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsClass: uiOptionsClass
        });
        var newOptions = [{dataValue: 'TW', displayValue: 'Twitter'}];
        dropdown.updateOptions(newOptions);
        var formOptionElements = fixture.getElementsByTagName('option');
        var uiOptionElements = fixture.getElementsByClassName(uiOptionsClass);
        QUnit.equal(formOptionElements[3].getAttribute('value'), newOptions[0].dataValue, 'after updating options, new form element was added with correct data value');
        QUnit.equal(formOptionElements[3].textContent, newOptions[0].displayValue, 'new form element has correct display value');
        QUnit.equal(uiOptionElements[3].getAttribute('data-value'), newOptions[0].dataValue, 'new ui element was added with correct data value');
        QUnit.equal(uiOptionElements[3].innerHTML, newOptions[0].displayValue, 'first new ui element has correct display value');
        dropdown.destroy();
    });

    QUnit.test('passing replace true to updateOptions() should clear out options before adding new ones', function() {
        QUnit.expect(5);
        var fixture = document.getElementById('qunit-fixture');
        var html =
            '<select>' +
                '<option value="AAPL">Apple</option>' +
                '<option value="FB">Facebook</option>' +
                '<option value="GOOG">Google</option>' +
            '</select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiContainerClass = 'my-ui-container';
        var uiOptionsClass = 'my-option';
        var clearOptionsSpy = Sinon.spy(Dropdown.prototype, 'clearOptions');
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsClass: uiOptionsClass
        });
        var newOptions = [{dataValue: 'TW', displayValue: 'Twitter'}];
        dropdown.updateOptions(newOptions, {replace: true});
        var formOptionElements = fixture.getElementsByTagName('option');
        var uiOptionElements = fixture.getElementsByClassName(uiOptionsClass);
        QUnit.equal(clearOptionsSpy.callCount, 1, 'clearOptions was called');
        QUnit.equal(formOptionElements[0].getAttribute('value'), newOptions[0].dataValue, 'new form element was added as first index with correct data value');
        QUnit.equal(formOptionElements[0].textContent, newOptions[0].displayValue, 'new form element has correct display value');
        QUnit.equal(uiOptionElements[0].getAttribute('data-value'), newOptions[0].dataValue, 'new ui element was added as first index with correct data value');
        QUnit.equal(uiOptionElements[0].innerHTML, newOptions[0].displayValue, 'first new ui element has correct display value');
        clearOptionsSpy.restore();
        dropdown.destroy();
    });

    QUnit.test('clearOptions() should clear all form and ui options in the dropdown', function() {
        QUnit.expect(2);
        var fixture = document.getElementById('qunit-fixture');
        var html =
            '<select>' +
                '<option value="AAPL">Apple</option>' +
                '<option value="FB">Facebook</option>' +
            '</select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiContainerClass = 'my-ui-container';
        var uiOptionsClass = 'my-option';
        var dropdown = new Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsClass: uiOptionsClass
        });
        dropdown.clearOptions();
        var formOptionElements = fixture.getElementsByTagName('option');
        var uiOptionElements = fixture.getElementsByClassName(uiOptionsClass);
        QUnit.equal(formOptionElements.length, 0, 'all form elements have been cleared');
        QUnit.equal(uiOptionElements.length, 0, 'all ui elements have been cleared');
        dropdown.destroy();
    });

    QUnit.test('ui dropdown element should be given a default tabindex attribute of zero on initialize when form element does not have one to make it focusable', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var html = '<select></select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var dropdown = new Dropdown({el: selectEl});
        QUnit.equal(dropdown.getUIElement().getAttribute('tabindex'), 0, 'ui dropdown was given a default tabindex of 0');
        dropdown.destroy();
    });

    QUnit.test('ui dropdown element should have same tabindex value as the form element on initialize', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var ti = 34;
        var html = '<select tabindex="' + ti + '"></select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var dropdown = new Dropdown({el: selectEl});
        QUnit.equal(dropdown.getUIElement().getAttribute('tabindex'), ti, 'tabindex attribute from form element was set on the ui element');
        dropdown.destroy();
    });

    QUnit.test('tabindex of form element should be set to -1 on initialize and set back when destroyed', function() {
        QUnit.expect(2);
        var fixture = document.getElementById('qunit-fixture');
        var ti = 5;
        var html = '<select tabindex="' + ti + '"></select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var dropdown = new Dropdown({el: selectEl});
        QUnit.equal(dropdown.getFormElement().getAttribute('tabindex'), -1, 'tabindex attribute on form element was set to -1');
        dropdown.destroy();
        QUnit.equal(dropdown.getFormElement().getAttribute('tabindex'), ti, 'tabindex attribute on form element was set back to its original value on destroy');
    });

    QUnit.test('tabindex of form element should NOT be set to -1 on initialize when on a mobile device', function() {
        QUnit.expect(2);
        var fixture = document.getElementById('qunit-fixture');
        deviceManagerIsMobileStub.returns(true);
        var ti = 5;
        var html = '<select tabindex="' + ti + '"></select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var dropdown = new Dropdown({el: selectEl});
        QUnit.equal(dropdown.getFormElement().getAttribute('tabindex'), ti, 'tabindex attribute on form element was NOT set to -1 because mobile devices should use native select element');
        QUnit.ok(!dropdown.getUIElement().getAttribute('tabindex'), 'ui element has no tabindex value');
        dropdown.destroy();
    });

    QUnit.test('callback assigned to onFocus of initialize options should be called when select element is focused', function() {
        QUnit.expect(3);
        var fixture = document.getElementById('qunit-fixture');
        var html = '<select></select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var focusSpy = Sinon.spy();
        var dropdown = new Dropdown({
            el: selectEl,
            onFocus: focusSpy
        });
        QUnit.equal(focusSpy.callCount, 0, 'onFocus callback was NOT yet triggered because it isnt initially focused');
        // trigger focus
        selectEl.dispatchEvent(TestUtils.createEvent('focus'));
        QUnit.equal(focusSpy.callCount, 1, 'onFocus callback was triggered after select element became focused');
        dropdown.destroy();
        selectEl.dispatchEvent(TestUtils.createEvent('focus'));
        QUnit.equal(focusSpy.callCount, 1, 'onFocus callback was NOT triggered after destroy when select element is focused again');
    });

    QUnit.test('callback assigned to onBlur of initialize options should be called when select element loses focus', function() {
        QUnit.expect(3);
        var fixture = document.getElementById('qunit-fixture');
        var html = '<select></select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var blurSpy = Sinon.spy();
        var dropdown = new Dropdown({
            el: selectEl,
            onBlur: blurSpy
        });
        QUnit.equal(blurSpy.callCount, 0, 'onBlur callback was NOT triggered because it isnt blurred yet');
        // trigger focus
        selectEl.dispatchEvent(TestUtils.createEvent('focus'));
        // trigger blur
        selectEl.dispatchEvent(TestUtils.createEvent('blur'));
        QUnit.equal(blurSpy.callCount, 1, 'onBlur callback was triggered after select element became focused');
        dropdown.destroy();
        // trigger focus
        selectEl.dispatchEvent(TestUtils.createEvent('focus'));
        // trigger blur
        selectEl.dispatchEvent(TestUtils.createEvent('blur'));
        QUnit.equal(blurSpy.callCount, 1, 'onBlur callback was NOT triggered after destroy when select element is focused then blurred again');
    });

    QUnit.test('callback assigned to onFocus of initialize options should be called when ui element is focused', function() {
        QUnit.expect(3);
        var fixture = document.getElementById('qunit-fixture');
        var html = '<select></select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var focusSpy = Sinon.spy();
        var dropdown = new Dropdown({
            el: selectEl,
            onFocus: focusSpy
        });
        var uiEl = dropdown.getUIElement();
        QUnit.equal(focusSpy.callCount, 0, 'onFocus callback was NOT yet triggered because it isnt initially focused');
        // trigger focus
        uiEl.dispatchEvent(TestUtils.createEvent('focus'));
        QUnit.equal(focusSpy.callCount, 1, 'onFocus callback was triggered after element became focused');
        dropdown.destroy();
        uiEl.dispatchEvent(TestUtils.createEvent('focus'));
        QUnit.equal(focusSpy.callCount, 1, 'onFocus callback was NOT triggered after destroy when element is focused again');
    });

    QUnit.test('callback assigned to onBlur of initialize options should be called when ui element loses focus', function() {
        QUnit.expect(3);
        var fixture = document.getElementById('qunit-fixture');
        var html = '<select></select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var blurSpy = Sinon.spy();
        var dropdown = new Dropdown({
            el: selectEl,
            onBlur: blurSpy
        });
        var uiEl = dropdown.getUIElement();
        QUnit.equal(blurSpy.callCount, 0, 'onBlur callback was NOT triggered because it isnt blurred yet');
        // trigger focus
        uiEl.dispatchEvent(TestUtils.createEvent('focus'));
        // trigger blur
        uiEl.dispatchEvent(TestUtils.createEvent('blur'));
        QUnit.equal(blurSpy.callCount, 1, 'onBlur callback was triggered after select element became focused');
        dropdown.destroy();
        // trigger focus
        uiEl.dispatchEvent(TestUtils.createEvent('focus'));
        // trigger blur
        uiEl.dispatchEvent(TestUtils.createEvent('blur'));
        QUnit.equal(blurSpy.callCount, 1, 'onBlur callback was NOT triggered after destroy when select element is focused then blurred again');
    });

    QUnit.test('calling showOptionsContainer() the first time should set first option as selected if there is not a pre-selected option', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var html =
            '<select>' +
                '<option value="">Default</option>' +
                '<option value="FB">Facebook</option>' +
            '</select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var uiOptionsClass = 'my-option';
        var myOptionSelected = 'opt-selected';
        var dropdown = new Dropdown({
            el: selectEl,
            optionsClass: uiOptionsClass,
            optionsSelected: myOptionSelected
        });
        dropdown.showOptionsContainer();
        var uiOptionEls = dropdown.getUIElement().getElementsByClassName(uiOptionsClass);
        QUnit.ok(!uiOptionEls[0].classList.contains(myOptionSelected), 'after calling showOptionsContainer() first ui option element is set to selected');
        dropdown.destroy();
    });

    QUnit.test('pressing up key while ui options container is not showing shows the container and does not cycle through options', function() {
        QUnit.expect(3);
        var fixture = document.getElementById('qunit-fixture');
        var html = '<select></select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var showOptionsContainerStub = Sinon.stub(Dropdown.prototype, 'showOptionsContainer');
        var highlighter = 'highlited';
        var dropdown = new Dropdown({el: selectEl, optionsHighlightedClass: highlighter});
        var uiEl = dropdown.getUIElement();
        QUnit.equal(showOptionsContainerStub.callCount, 0, 'showOptionsContainer() method was called because no key was pressed');
        // trigger focus
        uiEl.dispatchEvent(TestUtils.createEvent('focus'));
        var keyEvent = TestUtils.createEvent('keyup');
        // up arrow key
        keyEvent.keyCode = 38;
        uiEl.dispatchEvent(keyEvent);
        QUnit.equal(showOptionsContainerStub.callCount, 1, 'showOptionsContainer() method was called when up key was pressed');
        QUnit.equal(uiEl.getElementsByClassName(highlighter).length, 0, 'no ui options elements were highlighted');
        dropdown.destroy();
        showOptionsContainerStub.restore();
    });

    QUnit.test('pressing up key while ui options container is open when it does not have a previous sibling adds highlights to last ui option element', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var html =
            '<select>' +
                '<option value="AAPL">Apple</option>' +
                '<option value="FB">Facebook</option>' +
                '<option value="GOOG">Google</option>' +
            '</select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var highlighter = 'highlited';
        var optionsContainerClass = 'my-options';
        var dropdown = new Dropdown({
            el: selectEl,
            optionsHighlightedClass: highlighter,
            optionsContainerClass: optionsContainerClass
        });
        var uiEl = dropdown.getUIElement();
        var uiOptionsContainerEl = uiEl.getElementsByClassName(optionsContainerClass)[0];
        // trigger focus
        uiEl.dispatchEvent(TestUtils.createEvent('focus'));
        // open container
        dropdown.showOptionsContainer();
        var keyEvent = TestUtils.createEvent('keyup');
        // up arrow key
        keyEvent.keyCode = 38;
        uiEl.dispatchEvent(keyEvent);
        QUnit.deepEqual(uiOptionsContainerEl.getElementsByClassName(highlighter)[0], uiOptionsContainerEl.lastChild, 'last ui options element was highlighted');
        dropdown.destroy();
    });

    QUnit.test('pressing up key while on an ui option element moves highlight class to previous ui option', function() {
        QUnit.expect(2);
        var fixture = document.getElementById('qunit-fixture');
        var html =
            '<select>' +
                '<option value="AAPL">Apple</option>' +
                '<option value="FB" selected>Facebook</option>' +
                '<option value="GOOG">Google</option>' +
            '</select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var highlighter = 'highlited';
        var optionsContainerClass = 'my-options';
        var dropdown = new Dropdown({
            el: selectEl,
            optionsHighlightedClass: highlighter,
            optionsContainerClass: optionsContainerClass
        });
        var uiEl = dropdown.getUIElement();
        var uiOptionsContainerEl = uiEl.getElementsByClassName(optionsContainerClass)[0];
        var uiOptionEls = uiOptionsContainerEl.childNodes;
        // trigger focus
        uiEl.dispatchEvent(TestUtils.createEvent('focus'));
        // open container
        dropdown.showOptionsContainer();
        // second option element will automatically be highlighted since it is the selected one
        var keyEvent = TestUtils.createEvent('keyup');
        // up arrow key
        keyEvent.keyCode = 38;
        uiEl.dispatchEvent(keyEvent);
        QUnit.ok(uiOptionEls[0].classList.contains(highlighter), 'when highlight is on the second option, pressing up highlights first option');
        QUnit.ok(!uiOptionEls[1].classList.contains(highlighter), 'highlight class was removed from second option');
        dropdown.destroy();
    });

    QUnit.test('pressing down key while ui options container is not showing shows the container and does not cycle through options', function() {
        QUnit.expect(3);
        var fixture = document.getElementById('qunit-fixture');
        var html = '<select></select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var showOptionsContainerStub = Sinon.stub(Dropdown.prototype, 'showOptionsContainer');
        var highlighter = 'highlited';
        var dropdown = new Dropdown({el: selectEl, optionsHighlightedClass: highlighter});
        var uiEl = dropdown.getUIElement();
        QUnit.equal(showOptionsContainerStub.callCount, 0, 'showOptionsContainer() method was called because no key was pressed');
        // trigger focus
        uiEl.dispatchEvent(TestUtils.createEvent('focus'));
        var keyEvent = TestUtils.createEvent('keyup');
        // down arrow key
        keyEvent.keyCode = 40;
        uiEl.dispatchEvent(keyEvent);
        QUnit.equal(showOptionsContainerStub.callCount, 1, 'showOptionsContainer() method was called when up key was pressed');
        QUnit.equal(uiEl.getElementsByClassName(highlighter).length, 0, 'no ui options elements were highlighted');
        dropdown.destroy();
        showOptionsContainerStub.restore();
    });

    QUnit.test('pressing down key while ui options container is open when it does not have a next sibling adds highlights to first ui option element', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var html =
            '<select>' +
                '<option value="AAPL">Apple</option>' +
                '<option value="FB">Facebook</option>' +
                '<option value="GOOG" selected>Google</option>' +
            '</select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var highlighter = 'highlited';
        var optionsContainerClass = 'my-options';
        var dropdown = new Dropdown({
            el: selectEl,
            optionsHighlightedClass: highlighter,
            optionsContainerClass: optionsContainerClass
        });
        var uiEl = dropdown.getUIElement();
        var uiOptionsContainerEl = uiEl.getElementsByClassName(optionsContainerClass)[0];
        // trigger focus
        uiEl.dispatchEvent(TestUtils.createEvent('focus'));
        // open container
        dropdown.showOptionsContainer();
        var keyEvent = TestUtils.createEvent('keyup');
        // down arrow key
        keyEvent.keyCode = 40;
        uiEl.dispatchEvent(keyEvent);
        QUnit.deepEqual(uiOptionsContainerEl.getElementsByClassName(highlighter)[0], uiOptionsContainerEl.firstChild, 'first ui options element was highlighted');
        dropdown.destroy();
    });

    QUnit.test('pressing down key while on an ui option element moves highlight class to next ui option', function() {
        QUnit.expect(2);
        var fixture = document.getElementById('qunit-fixture');
        var html =
            '<select>' +
            '<option value="AAPL">Apple</option>' +
            '<option value="FB">Facebook</option>' +
            '<option value="GOOG">Google</option>' +
            '</select>';
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var highlighter = 'highlited';
        var optionsContainerClass = 'my-options';
        var dropdown = new Dropdown({
            el: selectEl,
            optionsHighlightedClass: highlighter,
            optionsContainerClass: optionsContainerClass
        });
        var uiEl = dropdown.getUIElement();
        var uiOptionsContainerEl = uiEl.getElementsByClassName(optionsContainerClass)[0];
        var uiOptionEls = uiOptionsContainerEl.childNodes;
        // trigger focus
        uiEl.dispatchEvent(TestUtils.createEvent('focus'));
        // open container
        dropdown.showOptionsContainer();
        // first option element will automatically
        // be highlighted since it is the selected one
        var keyEvent = TestUtils.createEvent('keyup');
        // down arrow key
        keyEvent.keyCode = 40;
        uiEl.dispatchEvent(keyEvent);
        QUnit.ok(uiOptionEls[1].classList.contains(highlighter), 'when highlight is on the first option, pressing down highlights second option');
        QUnit.ok(!uiOptionEls[0].classList.contains(highlighter), 'highlight class was removed from first option');
        dropdown.destroy();
    });

    QUnit.test('getValue() should return current value of dropdown', function() {
        QUnit.expect(1);
        var val = 'myTestVal';
        var html = '<select><option value="' + val + '"></option></select>';
        var selectEl = TestUtils.createHtmlElement(html);
        document.getElementById('qunit-fixture').appendChild(selectEl);
        var dropdown = new Dropdown({el: selectEl});
        dropdown.setValue(val);
        QUnit.equal(dropdown.getValue(), val);
        dropdown.destroy();
    });

    QUnit.test('clear() should remove selected dropdown item', function() {
        QUnit.expect(1);
        var val = 'myTestVal';
        var html =
            '<select>' +
                '<option value=""></option>' +
                '<option value="' + val + '"></option>' +
            '</select>';
        var selectEl = TestUtils.createHtmlElement(html);
        document.getElementById('qunit-fixture').appendChild(selectEl);
        var dropdown = new Dropdown({el: selectEl});
        dropdown.setValue(val);
        dropdown.clear();
        QUnit.equal(selectEl.value, '');
        dropdown.destroy();
    });

    QUnit.test('clear() does nothing if there is no dropdown option with a value that matches an empty string', function() {
        QUnit.expect(1);
        var val = 'myTestVal';
        var html = '<select><option value="' + val + '"></option></select>';
        var selectEl = TestUtils.createHtmlElement(html);
        document.getElementById('qunit-fixture').appendChild(selectEl);
        var dropdown = new Dropdown({el: selectEl});
        dropdown.setValue(val);
        dropdown.clear();
        QUnit.equal(selectEl.value, val);
        dropdown.destroy();
    });

})();