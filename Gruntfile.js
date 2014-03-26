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
            },
            docs: {
                files: ['README.md', 'docs/_template.html'],
                tasks: ['markdown']
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

        markdown: {
            all: {
                files: [{
                    expand: true,
                    src: 'README.md',
                    dest: 'docs/',
                    ext: '.html',
                    rename: function(d, s){
                        console.log(d, s);
                        return d + s.replace('README', 'index');
                    }
                }],
                options: {
                    template: 'docs/_template.html'
                }
            }
        }
    });

    grunt.loadTasks('tasks');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-markdown');

    grunt.registerTask('default', ['jshint', 'uglify']);
    grunt.registerTask('develop', ['jshint', 'uglify', 'watch']);
    grunt.registerTask('docs', ['markdown', 'watch']);
};
