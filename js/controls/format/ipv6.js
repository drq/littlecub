(function() {
    "use strict";

    LittleCub.Ipv6Control = LittleCub.TextControl.extend({
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
                    validation["message"] = LittleCub.findMessage("invalidIpv6", this.configs["theme"]);
                }
                return validation;
            }
        }, {
            TYPE : "ipv6",
            SCHEMA : {
                "pattern" : "/^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/"
            }
        }
    );

    LittleCub.controlClass(LittleCub.Ipv6Control.TYPE, LittleCub.Ipv6Control);
})();