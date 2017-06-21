"use strict";
let sinon = require('sinon');
let QUnit = require('qunit');
let FormElement = require('../src/form-element');

module.exports = (function () {

    QUnit.module('Form Element');

    QUnit.test('addEventListener() should add the event and removeEventListener() should remove it', function() {
        QUnit.expect(2);
        let fixture = document.getElementById('qunit-fixture');
        let btn = document.createElement('div');
        fixture.appendChild(btn);
        let instance = new FormElement();
        instance.onClickSpy = sinon.spy();
        instance.addEventListener(btn, 'click', 'onClickSpy', instance);
        btn.click();
        QUnit.equal(instance.onClickSpy.callCount, 1);
        instance.removeEventListener(btn, 'click', 'onClickSpy', instance);
        btn.click();
        QUnit.equal(instance.onClickSpy.callCount, 1);
        instance.destroy();
    });

    QUnit.test('should remove all event listeners on destroy', function() {
        QUnit.expect(2);
        let fixture = document.getElementById('qunit-fixture');
        let firstBtn = document.createElement('div');
        let secondBtn = document.createElement('div');
        fixture.appendChild(firstBtn);
        fixture.appendChild(secondBtn);
        let instance = new FormElement();
        instance.onClickSpy1 = sinon.spy();
        instance.onClickSpy2 = sinon.spy();
        let clickCounts = 0;
        instance.addEventListener(firstBtn, 'click', 'onClickSpy1', instance);
        instance.addEventListener(secondBtn, 'click', 'onClickSpy2', instance);
        firstBtn.click();
        secondBtn.click();
        clickCounts++;
        instance.destroy();
        firstBtn.click();
        secondBtn.click();
        QUnit.equal(instance.onClickSpy1.callCount, clickCounts);
        QUnit.equal(instance.onClickSpy2.callCount, clickCounts);
    });

    QUnit.test('should get closest ancestor by class name', function() {
        QUnit.expect(3);
        let html = ' \n\r' +
            '<div>' +
            '<div class="test-child"></div>' +
            '</div>';
        let el = document.createElement('li');
        el.classList.add('ancestor');
        el.setAttribute('data-more', 'more_data');
        el.innerHTML = html;
        let childEl = el.getElementsByClassName('test-child')[0];
        let instance = new FormElement();
        QUnit.equal(instance.getClosestAncestorElementByClassName(childEl, 'ancestor'), el, 'getting closest ancestor element returns correct element');
        QUnit.ok(!instance.getClosestAncestorElementByClassName(childEl, 'nothing'), 'returns falsy when no ancestors have the class specified');
        QUnit.ok(!instance.getClosestAncestorElementByClassName(childEl, 'test-child'), ' does NOT return the source element when attempting to get an ancestor element with the same class');
        instance.destroy();
    });

})();
