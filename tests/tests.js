"use strict";

// set config options
require.config({
    'baseUrl': '../',
    'paths': {
        qunit: 'tests/libs/qunit/qunit-require',
        sinon: 'tests/libs/sinon/sinon',
        'test-utils': 'tests/libs/test-utils',
        'underscore': 'bower_components/underscore/underscore-min',
        'element-kit': 'bower_components/element-kit/dist/element-kit.min'
    },
    shim: {
        sinon: {exports: 'sinon'},
        underscore: {exports: '_'}
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