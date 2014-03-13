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
                    'dist/lingual.min.js': ['dist/lingual.min.js']
                }
            }
        },

        jshint: {
            all: ['src/lingual.js']
        },

        watch: {
            scripts: {
                files: 'src/*.js',
                tasks: ['jshint', 'concat', 'uglify']
            }
        },

        concat: {
            dist: {
                src: [
                    'src/lingual.js',
                    'src/lingual.ko.js',
                ],
                dest: 'dist/lingual.min.js'
            }
        },
    });

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
    grunt.registerTask('develop', ['jshint', 'concat', 'uglify', 'watch']);
};
