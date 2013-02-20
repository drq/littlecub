(function() {
    "use strict";

    var LCTools = {
        "sidebar" : function() {
            $('[data-spy="scroll"]').each(function () {
                var $spy = $(this).scrollspy('refresh')
            });

            // side bar
            setTimeout(function () {
                var $window = $(window);
                $('.bs-docs-sidenav').affix({
                    offset: {
                        top: function () {
                            return $window.width() <= 980 ? 290 : 210
                        }
                        , bottom: 270
                    }
                })
            }, 100);
        },

        "schema": (function() {
            var _schema = {
                "type" : "This attribute defines the primitive type of the data. Only string value is supported.",
                "title" : "This attribute is a string that provides a short description of the instance property.",
                "description" : "This attribute is a string that provides a full description of the of purpose the instance property.",
                "default" : "This attribute defines the default value of the instance.",
                "minLength" : "This attribute defines the minimum length of the string.",
                "maxLength" : "This attribute defines the maximum length of the string.",
                "format" : "This property defines the type of data, content type, or microformat to be expected in the instance property values. The format value for this control is {controlType}.",
                "pattern" : "This attribute provides a regular expression that a string instance MUST match in order to be valid.",
                "enum" : "This provides an enumeration of all possible values that are valid for the instance property.",
                "items" : "This attribute defines the allowed items in an instance array.",
                "required" : "This attribute defines list of required child properties of an object type.",
                "minItems" : "This attribute defines the minimum number of values in an array.",
                "maxItems" : "This attribute defines the maximum number of values in an array.",
                "uniqueItems" : "This attribute indicates that all items in an array instance MUST be unique (contains no two identical values).",
                "properties" : "This attribute is an object with property definitions that define the valid values of instance object property values.",
                "minimum" : "This attribute defines the minimum value of the instance property when the type of the instance value is a number.",
                "maximum" : "This attribute defines the maximum value of the instance property when the type of the instance value is a number.",
                "exclusiveMinimum" : "This attribute indicates if the value of the instance (if the instance is a number) can not equal the number defined by the \"minimum\" attribute.",
                "exclusiveMaximum" : "This attribute indicates if the value of the instance (if the instance is a number) can not equal the number defined by the \"maximum\" attribute.",
                "multipleOf" : "This attribute defines what value the number instance must be multiply of."
            };
            var template = Handlebars.compile(
                "<table class=\"table table-bordered table-striped\">"
                    + "<colgroup><col class=\"span1\"><col class=\"span7\"></colgroup>"
                    + "<thead><tr><th>Keyword</th><th>Description</th></tr></thead>"
                    + "<tbody>{{#each items}}"
                    + "<tr><td><code>{{keyword}}</code></td><td>{{{description}}}</td></tr>"
                    + "{{/each}}</tbody></table>"
            );
            return function() {
                var keywords = arguments[0], controlType = arguments[1], dataType = arguments[2];
                var data = {
                    "items":[]
                };
                _.each(keywords, function(v) {
                    data["items"].push({
                        "keyword" : v,
                        "description" : _schema[v].replace("{controlType}", controlType).replace("{dataType}", dataType)
                    });
                });
                return template(data);
            };
        })(),

        "configs": (function() {
            var _configs = {
                "type" : "This option defines the control type. The type value for this control is {controlType}.",
                "label" : "This option is a string for control label.",
                "helper" : "This option is a string that provides a help hint for the control.",
                "required" : "This boolean option indicates whether the control must have a nonempty value or not.",
                "size" : "This option defines the size of the text field or number of visible options of the select field.",
                "name" : "This option provides the name attribute of the rendered field.",
                "fieldClass" : "This option provides additional style classes that will be added to the rendered field.",
                "readonly" : "This option provides indicates whether the rendered text field is readonly or not.",
                "placeholder" : "This option provides provides placeholder message for the rendered text field.",
                "validationEvent" : "This option defines the event that will trigger control validation.",
                "multiple" : "This option defines whether multiple options can be selected from a list or not.",
                "prompt" : "This option provides an optional prompt message that can be displayed next to the checkbox.",
                "rows" : "This option defines number of rows of the textarea field.",
                "cols" : "This option defines number of columns of the textarea field.",
                "items" : "This option contains configs for child controls of array control",
                "controls" : "This option contains configs for child controls of object control",
                "options" : "This provides list of option labels for the mapped schema enum attribute. It can either be a map object or an array that maps option labels to enum item by property key or array index.",
                "template": "This option specifies the custom template that will be used to render the control other than the default <code>control_{controlType}</code> template . It can be either a template id or a full template string.",
                "theme" : "This option specifies the theme that the rendition template belongs. This option will also be applied to child controls as well."
            };
            var template = Handlebars.compile(
                "<table class=\"table table-bordered table-striped\">"
                    + "<colgroup><col class=\"span1\"><col class=\"span7\"></colgroup>"
                    + "<thead><tr><th>Option</th><th>Description</th></tr></thead>"
                    + "<tbody>{{#each items}}"
                    + "<tr><td><code>{{option}}</code></td><td>{{{description}}}</td></tr>"
                    + "{{/each}}</tbody></table>"
            );
            return function() {
                var configs = arguments[0], controlType = arguments[1], dataType = arguments[2];
                var data = {
                    "items":[]
                };
                _.each(configs, function(v) {
                    data["items"].push({
                        "option" : v,
                        "description" : _configs[v].replace("{controlType}", controlType).replace("{dataType}", dataType)
                    });
                });
                return template(data);
            };
        })()
    };

    var env = function() {
        return this || (0, eval)('this');
    };
    (env)().LCTools = LCTools;
})();