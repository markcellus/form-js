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
            uglify: {
                files: {
                    'dist/form-min.js': ['dist/form.js']
                }
            },
            browserify: {
                files: {
                    'dist/form.js': ['src/**/*.js']
                },
                options: {
                    browserifyOptions: {
                        standalone: 'Form'
                    }

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