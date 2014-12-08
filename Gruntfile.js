module.exports = function(grunt) {
    "use strict";

    var banner = '/** \n' +
        '* FormJS - v<%= pkg.version %>.\n' +
        '* <%= pkg.repository.url %>\n' +
        '* Copyright <%= grunt.template.today("yyyy") %>. Licensed MIT.\n' +
        '*/\n';

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: [
            'dist',
            'src/libs/element-kit',
            'src/libs/require',
            'src/libs/underscore',
            'tests/libs/qunit/qunit.css',
            'tests/libs/qunit/qunit.js',
            'tests/libs/sinon'
        ],
        copy: {
            all: {
                files: [
                    {
                        expand: true,
                        cwd: 'bower_components/sinonjs',
                        dest: 'tests/libs/sinon',
                        src: ['sinon.js']
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/qunit/qunit',
                        dest: 'tests/libs/qunit',
                        src: ['qunit.js', 'qunit.css']
                    },
                    {
                        expand: true,
                        cwd: 'src',
                        dest: 'dist',
                        src: [
                            '**/*'
                        ]
                    }
                ]
            }
        },
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src',
                    dir: "dist",
                    removeCombined: true,
                    optimize: 'uglify',
                    uglify: {
                        preserveComments: true,
                        ASCIIOnly: true,
                        banner: banner
                    }
                }
            }
        },
        connect: {
            test: {
                options: {
                    hostname: 'localhost',
                    port: 7000
                }
            },
            local: {
                options: {
                    keepalive: true,
                    options: { livereload: true }
                }
            }
        },
        qunit: {
            local: {
                options: {
                    urls: [
                        'http://localhost:7000/tests/index.html'
                    ]
                }
            }
        },
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
        release: {
            options: {
                additionalFiles: ['bower.json'],
                tagName: 'v<%= version %>',
                commitMessage: 'release <%= version %>',
                npm: false
            }
        },
        usebanner: {
            all: {
                options: {
                    banner: banner,
                    linebreak: false
                },
                files: {
                    src: [
                        'dist/button-toggle.js',
                        'dist/checkbox.js',
                        'dist/form.js',
                        'dist/form-element.js',
                        'dist/input-field.js'
                    ]
                }
            }
        }
    });

    // Load grunt tasks from node modules
    require( "load-grunt-tasks" )( grunt , {
        loadGruntTasks: {
            pattern: 'grunt-*'
        }
    });

    // Default grunt
    grunt.registerTask( "build", [
        "clean",
        "copy:all",
        "requirejs",
        "usebanner",
        "test"
    ]);

    grunt.registerTask( "server", [
        "connect:local"
    ]);

    grunt.registerTask( "test", [
        "connect:test",
        "qunit"
    ]);

    grunt.registerTask("publish_docs", [
        "jsdoc",
        "githubPages:target"
    ]);
};