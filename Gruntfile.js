module.exports = function(grunt) {
    "use strict";

    var banner = '/** \n' +
        '* FormJS - v<%= pkg.version %>.\n' +
        '* <%= pkg.repository.url %>\n' +
        '* Copyright <%= grunt.template.today("yyyy") %>. Licensed MIT.\n' +
        '*/\n';

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: ['dist'],
        copy: {
            all: {
                files: [
                    {
                        expand: true,
                        cwd: 'bower_components/sinonjs',
                        dest: 'external/sinon',
                        src: ['sinon.js']
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/qunit/qunit',
                        dest: 'external/qunit',
                        src: ['qunit.js', 'qunit.css']
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/element-kit/dist',
                        dest: 'external/element-kit',
                        src: ['element-kit.min.js']
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/requirejs',
                        dest: 'external/requirejs',
                        src: ['require.js']
                    },
                    {
                        expand: true,
                        cwd: 'bower_components/underscore',
                        dest: 'external/underscore',
                        src: ['underscore-min.js']
                    }
                ]
            },
            src: {
                files: [
                    {
                        expand: true,
                        cwd: 'src',
                        dest: 'dist',
                        src: ['form.js']
                    }
                ]
            }
        },
        uglify: {
            my_target: {
                files: {
                    'dist/form.min.js': ['dist/form.js']
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
                    keepalive: true
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
                        'dist/**/*'
                    ]
                }
            }
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                commit: false,
                createTag: false,
                push: false,
                updateConfigs: ['pkg']
            }
        }
    });

    // Load grunt tasks from node modules
    require( "load-grunt-tasks" )( grunt , {
        loadGruntTasks: {
            pattern: 'grunt-*'
        }
    });

    grunt.task.registerTask('release', 'A custom release.', function(type) {
        type = type || 'patch';
        grunt.task.run([
            'bump:' + type,
            'build'
        ]);
    });

    // Default grunt
    grunt.registerTask( "build", [
        "clean",
        "copy:all",
        "copy:src",
        "uglify",
        "usebanner:all",
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