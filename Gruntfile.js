module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json');

    grunt.initConfig({

        pkg: pkg,

        uglify: {
            options: {
                banner: "// <%= pkg.name %> v<%= pkg.version %>\n",
                preserveComments: 'some'
            },
            main: {
                files: {
                    'dist/lingual.min.js': ['src/lingual.js']
                }
            }
        },

        jshint: {
            all: ['src/lingual.js'],
            options: {
                curly: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true,
                    module: true,
                    require: true
                },
            },
        },

        watch: {
            scripts: {
                files: 'src/lingual.js',
                tasks: ['uglify']
            }
        }
    });

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('develop', ['uglify', 'watch']);
};
