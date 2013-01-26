module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        clean: {
            build: ['build'],
            dist: ['dist']
        },
        pkg: grunt.file.readJSON('package.json'),
        connect: {
            server: {
                options: {
                    port: 9001,
                    keepalive: true
                }
            }
        },
        handlebars: {
            compile: {
                options: {
                    namespace: "LittleCub.templates",
                    wrapped: true,
                    processName: function(filePath) {
                        var pieces = filePath.split("/");
                        var fileName = pieces[pieces.length - 1];
                        if (fileName.indexOf(".hbs") != -1) {
                            fileName = fileName.substring(0,fileName.indexOf(".hbs"));
                        }
                        return fileName;
                    }
                },
                files: {
                    "build/templates.js": ["build/templates/*.hbs"]
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [
                    'js/littlecub.js',
                    'js/themes/themes.js',
                    'js/handlebars/helpers.js',
                    'build/templates.js',
                    'js/controls/base.js',
                    'js/controls/container.js',
                    'js/controls/object.js',
                    'js/controls/text.js',
                    'js/controls/textarea.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            dist: {
                src: 'dist/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },
        qunit: {
            all: ['test/**/*.html']
        }
    });

    grunt.registerTask('splitTemplates', 'Task for parsing and splitting templates from theme template files.', function() {
        grunt.file.recurse("themes", function callback(abspath, rootdir, subdir, filename) {
            grunt.log.writeln(abspath);
            grunt.log.writeln(subdir);
            if (filename.indexOf(".html", filename.length - ".html".length) !== -1) {
                var theme = filename.split(".")[0];
                grunt.log.writeln(theme);
                var fileContent = grunt.file.read(abspath);
                grunt.log.writeln(fileContent);
                //
                var startTag = "<script";
                var endTag = "</script>";
                var startIndex = 0, endIndex = 0;
                while (startIndex != -1 && endIndex != -1) {
                    startIndex = fileContent.indexOf(startTag,startIndex);
                    if (startIndex != -1) {
                        endIndex = fileContent.indexOf(endTag,startIndex);
                        if (endIndex != -1) {
                            var closingIndex = fileContent.indexOf(">",startIndex);
                            if (closingIndex != -1) {
                                grunt.log.writeln("------------------------------");
                                var scriptTag = fileContent.substring(startIndex + startTag.length, closingIndex);
                                grunt.log.writeln("-->" + scriptTag);
                                var idMatch = scriptTag.match(/id(\s*)=(\s*)(.*?)['"]+(.*?)['"]+/);
                                if (idMatch != null) {
                                    var id = idMatch[idMatch.length - 1];
                                    var isTemplate = id.indexOf("template-") == 0;
                                    if (isTemplate) {
                                        id = id.substring(9);
                                    }
                                    grunt.log.writeln("-->id:" + id);
                                    var templateContent = fileContent.substring(closingIndex + 1, endIndex);
                                    grunt.file.write("build/templates/" + (isTemplate ? "" : "_") + theme + "__" + id + ".hbs", templateContent);
                                    grunt.log.writeln(templateContent);
                                }
                            }
                            startIndex = endIndex + endTag.length;
                        }
                    }
                }
            }
        });
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Load the plugin that provides the "clean" task.
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Load the plugin that provides the "handlebars" task.
    grunt.loadNpmTasks('grunt-contrib-handlebars');

    // Load the plugin that provides the "concat" task.
    grunt.loadNpmTasks('grunt-contrib-concat');

    // Load the plugin that provides the "connect" task.
    grunt.loadNpmTasks('grunt-contrib-connect');

    // Load the plugin that provides the "connect" task.
    grunt.loadNpmTasks('grunt-contrib-qunit');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'splitTemplates', 'handlebars' , 'concat', 'uglify']);

};