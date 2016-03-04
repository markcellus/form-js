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
        }
    });

    grunt.loadNpmTasks('build-tools');
    require("load-grunt-tasks")(grunt);

    grunt.registerTask("publish_docs", [
        "jsdoc",
        "githubPages:target"
    ]);
};