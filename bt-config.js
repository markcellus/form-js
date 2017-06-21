'use strict';
module.exports = {

    dist: 'dist',
    build: {
        files: {
            'dist/form.js': ['src/form.js']
        },
        browserifyOptions: {
            standalone: 'Form'
        },
        minifyFiles: {
            'dist/form-min.js': ['dist/form.js']
        },
        bannerFiles: ['dist/*']
    },
    tests: {
        qunit: {
            files: ['tests/*.js']
        }
    }
};
