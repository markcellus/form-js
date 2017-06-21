requirejs.config({
    baseUrl: '../src',
    'paths': {
        'underscore': '../external/underscore/underscore-min',
        'element-kit': '../external/element-kit/element-kit.min'
    }
});

require(['form'], function (Form) {
    'use strict';

    let SampleView = function () {


        this.checkbox = new Form.Checkbox({
            el: document.getElementsByClassName('ui-checkbox-input')[0]
        });

        let checkboxToggleContainer = document.getElementsByClassName('multi-select-button-toggle')[0];
        this.multiSelectToggle = new Form.ButtonToggle({
            inputs: checkboxToggleContainer.getElementsByClassName('ui-button-toggle-input')
        });

        let radioToggleContainer = document.getElementsByClassName('single-select-button-toggle')[0];
        this.singleSelectToggle = new Form.ButtonToggle({
            inputs: radioToggleContainer.getElementsByClassName('ui-button-toggle-input')
        });

        this.inputField = new Form.InputField({
            el: document.getElementsByClassName('name-input-field')[0]
        });

    };

    return new SampleView();
});
