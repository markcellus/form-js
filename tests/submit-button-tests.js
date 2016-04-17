"use strict";
var Sinon = require('sinon');
var QUnit = require('qunit');
var TestUtils = require('test-utils');
var SubmitButton = require('../src/submit-button');

module.exports = (function () {

    QUnit.module('Submit Button');

    QUnit.test('clicking on submit button calls onClick options callback', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var btn = TestUtils.createHtmlElement('<button></button>');
        fixture.appendChild(btn);
        var onClickSpy = Sinon.spy();
        var instance = new SubmitButton({el: btn, onClick: onClickSpy});
        var clickEvent = TestUtils.createEvent('click');
        btn.dispatchEvent(clickEvent);
        QUnit.equal(onClickSpy.args[0][0], clickEvent, 'click event was passed to onClick callback on click');
        instance.destroy();
    });

    QUnit.test('clicking on submit button after destroying does NOT call onClick options callback', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var btn = TestUtils.createHtmlElement('<button></button>');
        fixture.appendChild(btn);
        var onClickSpy = Sinon.spy();
        var instance = new SubmitButton({el: btn, onClick: onClickSpy});
        instance.destroy();
        btn.dispatchEvent(TestUtils.createEvent('click'));
        QUnit.equal(onClickSpy.callCount, 0, 'onClick options callback was NOT fired');
    });

    QUnit.test('calling disable() sets disabled boolean to true', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var btn = TestUtils.createHtmlElement('<button></button>');
        fixture.appendChild(btn);
        var instance = new SubmitButton({el: btn});
        instance.disable();
        QUnit.equal(btn.disabled, true, 'disabled boolean returns true');
        instance.destroy();
    });

    QUnit.test('calling enable() sets the diabled boolean to false', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var btn = TestUtils.createHtmlElement('<button></button>');
        fixture.appendChild(btn);
        var instance = new SubmitButton({el: btn});
        instance.enable();
        QUnit.equal(btn.disabled, false, 'disabled boolean returns true');
        instance.destroy();
    });

    QUnit.test('calling disable() when enabled adds a disabled class to the button', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var btn = TestUtils.createHtmlElement('<button></button>');
        fixture.appendChild(btn);
        var disabledClass = 'my-disabled-btn';
        var instance = new SubmitButton({el: btn, disabledClass: disabledClass});
        instance.enable();
        instance.disable();
        QUnit.ok(btn.classList.contains(disabledClass), 'disabled class was added');
        instance.destroy();
    });

    QUnit.test('calling enable() when disabled removes the disabled class from the button', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var btn = TestUtils.createHtmlElement('<button></button>');
        var disabledClass = 'my-disabled-btn';
        fixture.appendChild(btn);
        var instance = new SubmitButton({el: btn, disabledClass: disabledClass});
        instance.disable();
        instance.enable();
        QUnit.ok(!btn.classList.contains(disabledClass), 'disabled class was removed');
        instance.destroy();
    });

})();
