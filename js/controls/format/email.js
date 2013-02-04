(function() {
    "use strict";

    LittleCub.EmailControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["template"] = this.configs["template"] || "control_text";
            },

            _validatePattern: function() {
                var validation = this.base();
                if (! validation["status"]) {
                    validation["message"] = LittleCub.findMessage("invalidEmail", this.configs["theme"]);
                }
                return validation;
            }
        }, {
            TYPE : "email",
            SCHEMA : {
                "pattern" : "/^[a-z0-9!\#\$%&'\*\-\/=\?\+\-\^_`\{\|\}~]+(?:\.[a-z0-9!\#\$%&'\*\-\/=\?\+\-\^_`\{\|\}~]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,6}$/i"
            }
        }
    );

    LittleCub.controlClass(LittleCub.EmailControl.TYPE, LittleCub.EmailControl);
})();