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
                    'dist/lingual.jquery.min.js': ['src/lingual.jquery.js']
                }
            }
        },

        jshint: {
            all: ['src/lingual.jquery.js'],
            options: {
                curly: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true,
                    $: true
                },
            },
        },

        watch: {
            scripts: {
                files: 'src/lingual.jquery.js',
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
