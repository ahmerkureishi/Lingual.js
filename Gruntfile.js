module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json');

    var banner = [ "<%= pkg.name %> v<%= pkg.version %>", "The MIT License (MIT)", "Copyright (c) 2014 <%= pkg.author %>" ].join("\n * ").trim();

    grunt.initConfig({

        pkg: pkg,

        uglify: {
            options: {
                banner: "/* " + banner + " */\n",
                preserveComments: 'some'
            },
            main: {
                files: {
                    'dist/lingual.min.js': ['src/lingual.js'],
                    'dist/lingual.ko.min.js': ['src/lingual.ko.js']
                }
            }
        },

        jshint: {
            all: ['src/lingual.js']
        },

        watch: {
            scripts: {
                files: 'src/*.js',
                tasks: ['jshint', 'uglify']
            }
        },

        concat: {
            dist: {
                src: [
                    'dist/*.js'
                ],
                dest: 'dist/lingual.plugins.js'
            }
        },
    });

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'uglify']);
    grunt.registerTask('develop', ['jshint', 'uglify', 'watch']);
};
