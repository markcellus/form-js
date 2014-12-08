require([
    '../build/utils',
    '../build/checkbox',
    '../build/button-toggle',
    '../build/input-field'
], function (
    Utils,
    Checkbox,
    ButtonToggle,
    InputField
) {
    'use strict';

    var SampleView = function () {


        this.checkbox = new Checkbox({
            el: document.getElementsByClassName('ui-checkbox-input')[0]
        });

        var checkboxToggleContainer = document.getElementsByClassName('multi-select-button-toggle')[0];
        this.multiSelectToggle = new ButtonToggle({
            inputs: checkboxToggleContainer.getElementsByClassName('ui-button-toggle-input')
        });

        var radioToggleContainer = document.getElementsByClassName('single-select-button-toggle')[0];
        this.singleSelectToggle = new ButtonToggle({
            inputs: radioToggleContainer.getElementsByClassName('ui-button-toggle-input')
        });

        this.inputField = new InputField({
            el: document.getElementsByClassName('name-input-field')[0]
        });


    };

    return new SampleView();
});