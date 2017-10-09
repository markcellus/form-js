import sinon from 'sinon';
import QUnit from 'qunit';
import {createHtmlElementFromString, createEvent} from '../utils/element';
import SubmitButton from '../src/submit-button';

module.exports = (function () {

    QUnit.module('Submit Button');

    QUnit.test('clicking on submit button calls onClick options callback', function() {
        QUnit.expect(1);
        let fixture = document.getElementById('qunit-fixture');
        let btn = createHtmlElementFromString('<button></button>');
        fixture.appendChild(btn);
        let onClickSpy = sinon.spy();
        let instance = new SubmitButton({el: btn, onClick: onClickSpy});
        let clickEvent = createEvent('click');
        btn.dispatchEvent(clickEvent);
        QUnit.equal(onClickSpy.args[0][0], clickEvent, 'click event was passed to onClick callback on click');
        instance.destroy();
    });

    QUnit.test('clicking on submit button after destroying does NOT call onClick options callback', function() {
        QUnit.expect(1);
        let fixture = document.getElementById('qunit-fixture');
        let btn = createHtmlElementFromString('<button></button>');
        fixture.appendChild(btn);
        let onClickSpy = sinon.spy();
        let instance = new SubmitButton({el: btn, onClick: onClickSpy});
        instance.destroy();
        btn.dispatchEvent(createEvent('click'));
        QUnit.equal(onClickSpy.callCount, 0, 'onClick options callback was NOT fired');
    });

    QUnit.test('calling disable() sets disabled boolean to true', function() {
        QUnit.expect(1);
        let fixture = document.getElementById('qunit-fixture');
        let btn = createHtmlElementFromString('<button></button>');
        fixture.appendChild(btn);
        let instance = new SubmitButton({el: btn});
        instance.disable();
        QUnit.equal(btn.disabled, true, 'disabled boolean returns true');
        instance.destroy();
    });

    QUnit.test('calling enable() sets the diabled boolean to false', function() {
        QUnit.expect(1);
        let fixture = document.getElementById('qunit-fixture');
        let btn = createHtmlElementFromString('<button></button>');
        fixture.appendChild(btn);
        let instance = new SubmitButton({el: btn});
        instance.enable();
        QUnit.equal(btn.disabled, false, 'disabled boolean returns true');
        instance.destroy();
    });

    QUnit.test('calling disable() when enabled adds a disabled class to the button', function() {
        QUnit.expect(1);
        let fixture = document.getElementById('qunit-fixture');
        let btn = createHtmlElementFromString('<button></button>');
        fixture.appendChild(btn);
        let disabledClass = 'my-disabled-btn';
        let instance = new SubmitButton({el: btn, disabledClass: disabledClass});
        instance.enable();
        instance.disable();
        QUnit.ok(btn.classList.contains(disabledClass), 'disabled class was added');
        instance.destroy();
    });

    QUnit.test('calling enable() when disabled removes the disabled class from the button', function() {
        QUnit.expect(1);
        let fixture = document.getElementById('qunit-fixture');
        let btn = createHtmlElementFromString('<button></button>');
        let disabledClass = 'my-disabled-btn';
        fixture.appendChild(btn);
        let instance = new SubmitButton({el: btn, disabledClass: disabledClass});
        instance.disable();
        instance.enable();
        QUnit.ok(!btn.classList.contains(disabledClass), 'disabled class was removed');
        instance.destroy();
    });

})();
