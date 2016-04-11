'use strict';
module.exports = {

    dist: 'dist',
    build: {
        files: {
            'dist/form.js': ['src/form.js'],
            'dist/checkboxes.js': ['src/checkboxes.js'],
            'dist/checkbox.js': ['src/checkbox.js'],
            'dist/dropdown.js': ['src/dropdown.js'],
            'dist/radios.js': ['src/radios.js'],
            'dist/input-field.js': ['src/input-field.js'],
            'dist/text-area.js': ['src/text-area.js']
        },
        browserifyOptions: {
            standalone: 'Form'
        },
        minifyFiles: {
            'dist/form-min.js': ['dist/form.js'],
            'dist/checkbox-min.js': ['dist/checkbox.js'],
            'dist/checkboxes-min.js': ['dist/checkboxes.js'],
            'dist/dropdown-min.js': ['dist/dropdown.js'],
            'dist/radios-min.js': ['dist/radios.js'],
            'dist/input-field-min.js': ['dist/input-field.js'],
            'dist/text-area-min.js': ['dist/text-area.js']
        },
        bannerFiles: ['dist/*']
    },
    tests: {
        qunit: {
            src: ['tests/*.js']
        }
    }
};
