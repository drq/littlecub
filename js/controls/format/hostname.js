(function() {
    "use strict";

    LittleCub.HostnameControl = LittleCub.TextControl.extend({
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
                    validation["message"] = LC.findMessage("invalidHostname", this.configs["theme"]);
                }
                return validation;
            }
        }, {
            TYPE : "hostname",
            SCHEMA : {
                "pattern" : "/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/"
            }
        }
    );

    LittleCub.controlClass(LittleCub.HostnameControl.TYPE, LittleCub.HostnameControl);
})();