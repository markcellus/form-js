module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jsdoc : {
            dist : {
                src: ['src/**/*.js'],
                options: {
                    destination: '_site-docs',
                    private: false
                }
            }
        },
        githubPages: {
            target: {
                options: {
                    commitMessage: 'push'
                },
                src: '_site-docs'
            }
        },
        bt: {
            dist: 'dist',
            min: {
                files: {
                    'dist/form-min.js': ['dist/form.js'],
                    'dist/button-toggle-min.js': ['dist/button-toggle.js'],
                    'dist/checkbox-min.js': ['dist/checkbox.js'],
                    'dist/dropdown-min.js': ['dist/dropdown.js'],
                    'dist/input-field-min.js': ['dist/input-field.js']
                }
            },
            build: {
                files: {
                    'dist/form.js': ['src/form.js'],
                    'dist/button-toggle.js': ['src/button-toggle.js'],
                    'dist/checkbox.js': ['src/checkbox.js'],
                    'dist/dropdown.js': ['src/dropdown.js'],
                    'dist/input-field.js': ['src/input-field.js']
                },
                browserifyOptions: {
                    standalone: 'Form'
                }
            },
            tests: {
                qunit: {
                    src: ['tests/*.js']
                }
            }
        }
    });

    require("load-grunt-tasks")(grunt);

    grunt.registerTask("publish_docs", [
        "jsdoc",
        "githubPages:target"
    ]);
};