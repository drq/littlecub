(function() {
    "use strict";

    /**
     * HELPER: #key_value
     *
     * Usage: {{#key_value obj}} Key: {{key}} // Value: {{value}} {{/key_value}}
     *
     * Iterate over an object, setting 'key' and 'value' for each property in the object.
     */
    Handlebars.registerHelper("key_value", function(obj, options) {
        if (!options) {
            options = obj;
            obj = this;
        }
        var buffer = "", key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                buffer += options.fn({key: key, value: obj[key]});
            }
        }
        return buffer;
    });

    /**
     * HELPER: #each_with_key
     *
     * Usage: {{#each_with_key container key="myKey"}}...{{/each_with_key}}
     *
     * Iterate over an object containing other objects. Each
     * inner object will be used in turn, with an added key ("myKey")
     * set to the value of the inner object's key in the container.
     */
    Handlebars.registerHelper("each_with_key", function(obj, options) {
        var context, buffer = "", key, keyName = options.hash.key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                context = obj[key];
                if (keyName) {
                    context[keyName] = key;
                }
                buffer += options.fn(context);
            }
        }
        return buffer;
    });

    /**
     *
     */
    Handlebars.registerHelper('include', function (context, options) {
        var val = this["value"] || this;
        var themeId = val["theme"] || "default";
        var template = Handlebars.partials[themeId + "__" + context];

        // check parent theme
        var theme = LittleCub.themes[themeId];
        var parentThemeId = theme["parent"];
        if (!template) {
            template = Handlebars.partials[parentThemeId + "__" + context];
        }

        return new Handlebars.SafeString(template(val));
    });

    /**
     *
     */
    Handlebars.registerHelper('injectField', function (context, options) {
        var themeId = this["theme"] || "default";
        var template = Handlebars.partials[themeId + "__" + "control_" + this.type];

        // check parent theme
        var theme = LittleCub.themes[themeId];
        var parentThemeId = theme["parent"];
        if (!template) {
            template = Handlebars.partials[parentThemeId + "__" + "control_" + this.type];
        }

        return new Handlebars.SafeString(template(this)) + context.fn();
    });
}());