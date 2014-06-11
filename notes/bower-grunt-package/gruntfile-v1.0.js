module.exports = function(grunt) {
    // Project Configuration
    grunt.initConfig({
        // pkg: grunt.file.readJSON('package.json'),
        copy: {
            build: {
              files:
                  [
                      {
                       src: ['app/**/**','!**/*.jade'],
                       dest: 'build',
                       expand: true
                      },{
                       src: ['app/**/**/**','!**/*.jade'],
                       dest: 'build',
                       expand: true
                      },
                      {
                       src: ['public/**/**','!**/*.jade'],
                       dest: 'build',
                       expand: true
                      },
                      {
                       src: ['public/**/**/**','!**/*.jade'],
                       dest: 'build',
                       expand: true
                      },
                      {
                       src: ['config/*','!**/*.jade'],
                       dest: 'build',
                       expand: true
                      },
                      {
                       src: ['config/**','!**/*.jade'],
                       dest: 'build',
                       expand: true
                      },
                      {
                       src: ['server.js'],
                       dest: 'build'
                       //expand: true
                      }
                  ]
            }

        },
        clean: {
            build: {
                src: ['build']
            },
            stylesheets: {
                src: ['build/**/*.css', '!build/application.css']
            },
            scripts: {
                src: ['build/**/*.js', '!build/application.js']
            }
        },
        cssmin: {

            build: {
                files: {
                    'build/application.css': ['build/**/*.css']
                }
            }

        },
        uglify: {

            build: {
                options: {
                    mangle: false
                },
                files: {
                  'build/application.js': ['build/**/*.js']
                }
            }

        },
        jade: {
            compile: {
                options: {
                    data: {}
                },
                files: [
                  {
                      expand: true,
                      cwd: 'app',
                      src: ['**/*/jade'],
                      dest: 'build',
                      ext: '.html'
                  },
                  {
                      expand: true,
                      cwd: 'public',
                      src: ['**/*/jade'],
                      dest: 'build',
                      ext: '.html'
                  }
                ]
            }
        },
        watch: {

            jade: {
                files: [ 'app/**/*.jade', 'public/**/*.jade'],
                tasks: ['jade'],
                options: {
                    livereload: true
                },
            },
            copy: {
                files: ['app/**', 'public/**', 'config/**', '!app/**/*.jade', '!public/**/*.jade']
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
        connect: {
            server: {
                script: 'server.js',
                options: {
                    port: 4000,
                    base: 'build',
                    hostname: 'localhost'
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
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-connect');

    //Making grunt default to force in order not to break the project.
    grunt.option('force', true);

    //Default task(s).
    grunt.registerTask(
        'default',
        'watches the project for changes, automatically builds them and runs a server',
        ['build','connect', 'watch', 'jshint', 'concurrent']

    );
    grunt.registerTask(
        'stylesheets',
        'compiles the stylesheets',
        ['cssmin','clean:stylesheets']

    );
    grunt.registerTask(
        'scripts',
        'compiles the javascript files.',
        ['uglify', 'clean:scripts']
    );
    grunt.registerTask(
        'build',
        ['clean:build', 'copy', 'stylesheets','scripts','jade']
    );

    //Test task.
    grunt.registerTask('test', ['mochaTest']);
};
