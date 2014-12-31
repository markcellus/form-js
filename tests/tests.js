"use strict";

// set config options
require.config({
    'baseUrl': '../',
    'paths': {
        qunit: 'external/qunit/qunit-require',
        sinon: 'external/sinon/sinon',
        'test-utils': 'tests/test-utils',
        'underscore': 'external/underscore/underscore-min',
        'element-kit': 'external/element-kit/element-kit.min'
    },
    shim: {
        sinon: {exports: 'sinon'}
    }
});

// require each test
require([
    'tests/checkbox-tests',
    'tests/button-toggle-tests',
    'tests/input-field-tests',
    'tests/form-tests'
], function() {
    QUnit.config.requireExpects = true;
    QUnit.start();
});