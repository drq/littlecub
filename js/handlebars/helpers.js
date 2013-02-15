(function() {
    "use strict";

    /**
     * HELPER: #key_value
     *
     * Usage: {{#key_value obj}} Key: {{key}} // Value: {{value}} {{/key_value}}
     *
     * Iterate over an object, setting 'key' and 'value' for each property in the object.
     */
    Handlebars.registerHelper("key_value", function(obj, configs) {
        if (!configs) {
            configs = obj;
            obj = this;
        }
        var buffer = "";
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                buffer += configs.fn({key: key, value: obj[key]});
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
    Handlebars.registerHelper("each_with_key", function(obj, configs) {
        var context, buffer = "", keyName = configs.hash.key;
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                context = obj[key];
                if (keyName) {
                    context[keyName] = key;
                }
                buffer += configs.fn(context);
            }
        }
        return buffer;
    });

    Handlebars.registerHelper("object_with_key", function(context, configs) {
        var keyName = configs.hash.key;
        if (context.hasOwnProperty(keyName)) {
            return configs.fn(context[keyName]);
        } else {
            return "";
        }
    });

    /**
     *
     */
    Handlebars.registerHelper('include', function (context, configs) {
        var val = this["value"] || this;
        var themeId = val["theme"];
        var template = LittleCub.findTemplate(themeId, context);
        return template ? new Handlebars.SafeString(template(val)) : "";
    });

    /**
     *
     */
    Handlebars.registerHelper('injectControl', function (context, configs) {
        var themeId = this["theme"];
        var templateId = this["template"] || "control_" + this.type;
        var template = LittleCub.findTemplate(themeId, templateId);
        if (!template && this["altTemplate"]) {
            template = LittleCub.findTemplate(themeId, this["altTemplate"]);
        }
        return template ? new Handlebars.SafeString(template(this)) : "";
    });

    /**
     *
     */
    Handlebars.registerHelper('isContainer', function(context, options) {
        if (this.isContainer) {
            return context.fn(this);
        }
        return context.inverse(this);
    });

    /**
     *
     */
    Handlebars.registerHelper('isType', function(v, context) {
        v = v.split(' ');
        if (_.indexOf(v, this["type"]) != -1) {
            return context.fn(this);
        }
        return context.inverse(this);
    });
})();