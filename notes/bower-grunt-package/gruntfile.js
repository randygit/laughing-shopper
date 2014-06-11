module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            development: {
                options: {
                  concat: false,
                  paths: ["public/css"],
                  require: ["public/lib/bootstrap/less/mixins.less", "public/lib/bootstrap/less/variables.less"]
                }
            },
            files: {
                "public/css/index.css" : "public/css/index.less",
                "public/css/customstyle.css" : "public/css/customstyle.less",
                "public/css/signup.css" : "public/css/signup.less"
            }
        },
        watch: {

            less: {
                files: ['public/css/*.less'],
                tasks: ['lessc'],
                options: {
                    livereload: true,
                },
            },
            jade: {
                files: [ 'app/views/**', 'public/views/**'],
                options: {
                    livereload: true
                },
            },
            js: {
                files: ['public/js/**', 'app/**/*.js'],
                tasks: ['jshint'],
                options: {
                    livereload: true,
                },
            },
            css: {
                files: ['public/css/**'],
                options: {
                    livereload: true
                }
            }
        },
        jshint: {
            all: ['gruntfile.js', 'public/js/**/*.js', 'test/**/*.js', 'app/**/*.js', 'config/*.js']
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    args: [],

                    ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
                    watchedExtensions: ['js','jade'],
                    watchedFolders: ['app', 'config', 'public/view', 'public/js'],
                    debug: true,

	                  ignore: ['public/**'],
                    ext: 'js',
                    nodeArgs: ['--debug'],
                    delayTime: 1,
                    env: {
                        PORT: 3000
                    },
                    cwd: __dirname
                }
            }
        },
        concurrent: {
            tasks: ['nodemon', 'watch'],
            options: {
                logConcurrentOutput: true
            }
        },
        mochaTest: {
            options: {
                reporter: 'spec'
            },
            src: ['test/**/*.js']
        }
    });

    //Load NPM tasks
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    //Default task(s).
    grunt.registerTask('default', ['jshint', 'concurrent']);

    //Test task.
    grunt.registerTask('test', ['mochaTest']);
};
