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

    QUnit.module('Dropdown Tests');

    var html =
        '<select>' +
            '<option value="AAPL">Apple</option>' +
            '<option value="FB">Facebook</option>' +
            '<option value="GOOG">Google</option>' +
        '</select>';

    QUnit.test('setting and getting dropdown values (mobile)', function() {
        QUnit.expect(7);
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var origWindowOrientation = window.orientation;
        window.orientation = true; // make sure we're testing for mobile
        var options = selectEl.getElementsByTagName('option');
        options[1].selected = true; // make second item selected initially
        var onChangeSpy = Sinon.spy();
        var dropdown = new Form.Dropdown({el: selectEl, onChange: onChangeSpy});
        QUnit.equal(dropdown.getValue(), options[1].value, 'calling getValue() returns second item\'s value since it is was designated as selected initially');
        QUnit.equal(dropdown.getDisplayValue(), options[1].textContent, 'calling getDisplayValue() returns second item\'s display value');
        QUnit.equal(onChangeSpy.callCount, 0, 'onChange callback was NOT fired because value hasnt been changed yet');
        // set to third value
        var selectChangeSpy = Sinon.spy();
        selectEl.onchange = selectChangeSpy;
        dropdown.setValue('GOOG');
        QUnit.equal(dropdown.getValue(), options[2].value, 'calling getValue() after setting the value to third item returns third item\'s value since it is was designated as selected initially');
        QUnit.equal(dropdown.getDisplayValue(), options[2].textContent, 'calling getDisplayValue() returns third item\'s display value');
        QUnit.equal(selectChangeSpy.callCount, 1, 'selects native change event was fired');
        QUnit.deepEqual(onChangeSpy.args[0], [selectEl, selectEl, selectChangeSpy.args[0][0]], 'onChange callback was fired with third items args');
        dropdown.destroy();
        window.orientation = origWindowOrientation;
    });

    QUnit.test('initialize, setup, and destruction (desktop)', function() {
        QUnit.expect(7);
        var origWindowOrientation = window.orientation;
        window.orientation = undefined; // make sure we're testing for desktop
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        // test
        var uiContainerClass = 'my-ui-container';
        var uiOptionsContainerClass = 'my-options-container';
        var uiOptionsClass = 'my-option';
        var uiSelectedValueContainerClass = 'my-selected-val-container';
        var originalDisplayType = 'inline-block';
        selectEl.style.display = originalDisplayType; // set to inline block to test if put back on destroy
        var dropdown = new Form.Dropdown({
            el: selectEl,
            containerClass: uiContainerClass,
            optionsContainerClass: uiOptionsContainerClass,
            optionsClass: uiOptionsClass,
            selectedValueContainerClass: uiSelectedValueContainerClass
        });
        QUnit.equal(selectEl.style.display, 'none', 'after initializing, form select element is hidden');
        var uiEl = fixture.getElementsByClassName(uiContainerClass)[0];
        QUnit.equal(selectEl.nextSibling, uiEl, 'ui element container html has been built and added as a sibling of the original form select element');
        QUnit.equal(uiEl.getElementsByClassName(uiSelectedValueContainerClass).length, 1, 'ui selected value container html was added as a child of the ui element container');
        var uiSelectedValueContainer = uiEl.getElementsByClassName(uiSelectedValueContainerClass)[0];
        QUnit.equal(uiSelectedValueContainer.getAttribute('data-value'), '', 'ui selected value container has no data-value initially');
        QUnit.equal(uiSelectedValueContainer.textContent, '', 'ui selected value container has no inner text content (display value) initially');
        dropdown.destroy();
        QUnit.equal(selectEl.nextSibling, fixture.getElementsByClassName(uiContainerClass)[0], 'after destroy(), ui element container html has been removed as a sibling of the original form select element');
        QUnit.equal(selectEl.style.display, originalDisplayType, 'original display type of form select element was reverted back to original');
        window.orientation = origWindowOrientation;
    });

    QUnit.test('initializing when a dropdown item is pre-selected (desktop)', function() {
        QUnit.expect(4);
        var origWindowOrientation = window.orientation;
        window.orientation = undefined; // make sure we're testing for desktop
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
        var dropdown = new Form.Dropdown({
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
        window.orientation = origWindowOrientation;
    });

    QUnit.test('clicking through ui dropdown selections (desktop)', function() {
        QUnit.expect(5);
        var origWindowOrientation = window.orientation;
        window.orientation = undefined; // make sure we're testing for desktop
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
        var dropdown = new Form.Dropdown({
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
        QUnit.deepEqual(onChangeSpy.args[0], [selectEl, uiEl, selectChangeSpy.args[0][0]], 'onChange callback was fired with correct args');

        dropdown.destroy();
        window.orientation = origWindowOrientation;
    });

    QUnit.test('get option element by its data and display value', function() {
        QUnit.expect(2);
        var origWindowOrientation = window.orientation;
        window.orientation = true; // test for mobile but would work for desktops too
        var fixture = document.getElementById('qunit-fixture');
        var selectEl = TestUtils.createHtmlElement(html);
        fixture.appendChild(selectEl);
        var options = selectEl.getElementsByTagName('option');
        var dropdown = new Form.Dropdown({el: selectEl});
        QUnit.equal(dropdown.getOptionByDisplayValue(options[1].innerHTML), options[1], 'calling getOptionByDisplayValue() with second items display value returns the second item option el');
        QUnit.equal(dropdown.getOptionByDataValue(options[1].value), options[1], 'calling getOptionByDataValue() with second items display value returns the second item option el');
        dropdown.destroy();
        window.orientation = origWindowOrientation;
    });

    QUnit.test('enabling and disabling dropdown', function() {
        QUnit.expect(18);
        var origWindowOrientation = window.orientation;
        window.orientation = undefined; // make sure we're testing for desktop
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
        var dropdown = new Form.Dropdown({
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
        uiSelectedValueContainerEl.dispatchEvent(TestUtils.createEvent('click'));
        QUnit.ok(uiEl.classList.contains(uiOptionsContainerActiveClass), 'after clicking on selected value container element, options container does NOT have active class');
        // click on second option element
        uiOptionEls[1].dispatchEvent(TestUtils.createEvent('click'));
        QUnit.equal(selectEl.value, '', 'when clicking on an option while the dropdown is disabled, select element data value still did not change');
        QUnit.equal(uiSelectedValueContainerEl.getAttribute('data-value'), '', 'ui element selected container data value is still empty');
        QUnit.equal(uiSelectedValueContainerEl.innerHTML, '', 'ui element selected container display value is still empty');
        QUnit.equal(uiOptionsContainerEl.getElementsByClassName(uiOptionsSelectedClass).length, 0, 'there are still no selected ui option elements');
        QUnit.equal(onChangeSpy.callCount, 0, 'onChange callback did NOT fire');
        dropdown.destroy();
        window.orientation = origWindowOrientation;
    });

});