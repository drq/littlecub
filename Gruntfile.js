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
                            fileName = fileName.substring(0, fileName.indexOf(".hbs"));
                        }
                        return fileName;
                    }
                },
                files: {
                    "build/templates-default.js": ["build/templates/default/*.hbs"],
                    "build/templates-bootstrap.js": ["build/templates/bootstrap/*.hbs"],
                    "build/templates-bootstrap2.js": ["build/templates/bootstrap2/*.hbs"],
                    "build/templates-foundation.js": ["build/templates/foundation/*.hbs"],
                    "build/templates-jqueryui.js": ["build/templates/jqueryui/*.hbs"],
                    "build/templates-jquerymobile.js": ["build/templates/jquerymobile/*.hbs"]
                }
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            core: {
                src: [
                    'license.txt',
                    'js/base.js',
                    'js/littlecub.js',
                    'js/themes/themes.js',
                    'js/handlebars/helpers.js',
                    'js/controls/base.js',
                    'js/controls/container.js',
                    'js/controls/object.js',
                    'js/controls/text.js',
                    'js/controls/textarea.js',
                    'js/controls/number.js',
                    'js/controls/integer.js',
                    'js/controls/checkbox.js',
                    'js/controls/list.js',
                    'js/controls/radio.js',
                    'js/controls/select.js',
                    'js/controls/checkboxgroup.js',
                    'js/controls/file.js',
                    'js/controls/hidden.js',
                    'js/controls/array.js',
                    'js/controls/password.js',
                    'js/controls/format/datetime.js',
                    'js/controls/format/email.js',
                    'js/controls/format/hostname.js',
                    'js/controls/format/ipv4.js',
                    'js/controls/format/ipv6.js',
                    'js/controls/format/uri.js'
                ],
                dest: 'dist/<%= pkg.name %>-core.js'
            },
            "default": {
                src: [
                    'dist/<%= pkg.name %>-core.js',
                    'js/themes/default.js',
                    'build/templates-default.js'
                ],
                dest: 'dist/<%= pkg.name %>.js'
            },
            "bootstrap": {
                src: [
                    'dist/<%= pkg.name %>-core.js',
                    'js/themes/bootstrap.js',
                    'build/templates-bootstrap.js'
                ],
                dest: 'dist/<%= pkg.name %>-bootstrap.js'
            },
            "bootstrap2": {
                src: [
                    'dist/<%= pkg.name %>-core.js',
                    'js/themes/bootstrap2.js',
                    'build/templates-bootstrap2.js'
                ],
                dest: 'dist/<%= pkg.name %>-bootstrap2.js'
            },
            "foundation": {
                src: [
                    'dist/<%= pkg.name %>-core.js',
                    'js/themes/foundation.js',
                    'build/templates-foundation.js'
                ],
                dest: 'dist/<%= pkg.name %>-foundation.js'
            },
            "jqueryui": {
                src: [
                    'dist/<%= pkg.name %>-core.js',
                    'js/themes/jqueryui.js',
                    'build/templates-jqueryui.js'
                ],
                dest: 'dist/<%= pkg.name %>-jqueryui.js'
            },
            "jquerymobile": {
                src: [
                    'dist/<%= pkg.name %>-core.js',
                    'js/themes/jquerymobile.js',
                    'build/templates-jquerymobile.js'
                ],
                dest: 'dist/<%= pkg.name %>-jquerymobile.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %>\nCopyright 2014 NextFrontier Technologies Inc. Licensed under the Apache 2 license.\n https://github.com/drq/littlecub/blob/master/license.txt */'
            },
            core: {
                src: 'dist/<%= pkg.name %>-core.js',
                dest: 'dist/<%= pkg.name %>-core.min.js'
            },
            "default": {
                src: 'dist/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            },
            "bootstrap": {
                src: 'dist/<%= pkg.name %>-bootstrap.js',
                dest: 'dist/<%= pkg.name %>-bootstrap.min.js'
            },
            "bootstrap2": {
                src: 'dist/<%= pkg.name %>-bootstrap2.js',
                dest: 'dist/<%= pkg.name %>-bootstrap2.min.js'
            },
            "foundation": {
                src: 'dist/<%= pkg.name %>-foundation.js',
                dest: 'dist/<%= pkg.name %>-foundation.min.js'
            },
            "jqueryui": {
                src: 'dist/<%= pkg.name %>-jqueryui.js',
                dest: 'dist/<%= pkg.name %>-jqueryui.min.js'
            },
            "jquerymobile": {
                src: 'dist/<%= pkg.name %>-jquerymobile.js',
                dest: 'dist/<%= pkg.name %>-jquerymobile.min.js'
            },
            "default-templates": {
                src: 'build/templates-default.js',
                dest: 'dist/templates-default.min.js'
            },
            "bootstrap-templates": {
                src: 'build/templates-bootstrap.js',
                dest: 'dist/templates-bootstrap.min.js'
            },
            "bootstrap2-templates": {
                src: 'build/templates-bootstrap2.js',
                dest: 'dist/templates-bootstrap2.min.js'
            },
            "foundation-templates": {
                src: 'build/templates-foundation.js',
                dest: 'dist/templates-foundation.min.js'
            },
            "jqueryui-templates": {
                src: 'build/templates-jqueryui.js',
                dest: 'dist/templates-jqueryui.min.js'
            },
            "jquerymobile-templates": {
                src: 'build/templates-jquerymobile.js',
                dest: 'dist/templates-jquerymobile.min.js'
            }
        },
        qunit: {
            all: ['test/**/*.html']
        },
        compress: {
            zip: {
                options: {
                    archive: 'dist/littlecub.zip',
                    mode: 'zip'
                },
                files: [
                    { src: ['dist/*.js', 'themes/**', 'js/**'] }
                ]
            },
            tgz: {
                options: {
                    archive: 'dist/littlecub.tar.gz',
                    mode: 'tgz'
                },
                files: [
                    { src: ['dist/*.js', 'themes/**', 'js/**'] }
                ]
            }
        }
    });

    grunt.registerTask('splitTemplates', 'Task for parsing and splitting templates from theme template files.', function() {
        grunt.file.recurse("themes", function callback(abspath, rootdir, subdir, filename) {
            grunt.log.writeln("------------------------------------------------------------");
            grunt.log.writeln("template :: " + abspath);
            //grunt.log.writeln("subdir ==>" + subdir);
            if (filename.indexOf(".html", filename.length - ".html".length) !== -1) {
                var theme = filename.split(".")[0];
                grunt.log.writeln("theme :: " + theme);
                var fileContent = grunt.file.read(abspath);
                //grunt.log.writeln(fileContent);
                //
                var startTag = "<script";
                var endTag = "</script>";
                var startIndex = 0, endIndex = 0;
                while (startIndex != -1 && endIndex != -1) {
                    startIndex = fileContent.indexOf(startTag, startIndex);
                    if (startIndex != -1) {
                        endIndex = fileContent.indexOf(endTag, startIndex);
                        if (endIndex != -1) {
                            var closingIndex = fileContent.indexOf(">", startIndex);
                            if (closingIndex != -1) {
                                //grunt.log.writeln("------------------------------");
                                var scriptTag = fileContent.substring(startIndex + startTag.length, closingIndex);
                                var idMatch = scriptTag.match(/id(\s*)=(\s*)(.*?)['"]+(.*?)['"]+/);
                                if (idMatch != null) {
                                    var id = idMatch[idMatch.length - 1];
                                    var templateIdList = id.split(",");
                                    for (var i = 0; i < templateIdList.length; i++) {
                                        var _id = templateIdList[i].trim();
                                        if (_id) {
                                            var isTemplate = _id.indexOf("template-") == 0;
                                            if (isTemplate) {
                                                _id = _id.substring(9);
                                            }
                                            grunt.log.writeln("id :: " + _id);
                                            var templateContent = fileContent.substring(closingIndex + 1, endIndex).trim();
                                            grunt.file.write("build/templates/" + subdir + "/" + (isTemplate ? "" : "_") + theme + "__" + _id + ".hbs", templateContent);
                                            //grunt.log.writeln(templateContent);
                                        }
                                    }
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

    // Load the plugin that provides the "compress" task.
    grunt.loadNpmTasks('grunt-contrib-compress');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'splitTemplates', 'handlebars' , 'concat', 'uglify', 'compress']);

    grunt.registerTask('test', ['default', 'qunit']);
};