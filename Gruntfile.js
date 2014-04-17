var fs = require('fs');

module.exports = function(grunt) {

    var pkg = grunt.file.readJSON('package.json');

    var banner = [ "<%= pkg.name %> v<%= pkg.version %>", "The MIT License (MIT)", "Copyright (c) 2014 <%= pkg.author %>" ].join("\n * ").trim();

    grunt.initConfig({

        pkg: pkg,

        uglify: {
            options: {
                banner: "/* " + banner + " */\n",
                preserveComments: 'some',
                footer: "Lingual.version='<%= pkg.version %>';"
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
            },
            manifests: {
                files: ['package.json'],
                tasks: ['sync_versions']
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

    // Custom task
    grunt.registerTask('sync_versions', 'Keeps versions in sync between NPM and Bower', function(){
        var bower = {
            name: pkg.name,
            author: pkg.author,
            version: pkg.version,
            main: 'dist/lingual.min.js'
        };
        fs.writeFileSync('bower.json', JSON.stringify(bower, null, "\t"));
    });

    grunt.registerTask('default', ['jshint', 'uglify', 'sync_versions']);
    grunt.registerTask('develop', ['jshint', 'uglify', 'sync_versions', 'watch']);
    grunt.registerTask('docs', ['markdown', 'watch']);
};
