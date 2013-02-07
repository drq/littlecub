(function() {
    "use strict";

    LittleCub.Ipv4Control = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["altTemplate"] = "control_text";
            },

            _validatePattern: function() {
                var validation = this.base();
                if (! validation["status"]) {
                    validation["message"] = LC.findMessage("invalidIpv4", this.configs["theme"]);
                }
                return validation;
            }
        }, {
            TYPE : "ipv4",
            SCHEMA : {
                "pattern" : "/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/"
            }
        }
    );

    LittleCub.controlClass(LittleCub.Ipv4Control.TYPE, LittleCub.Ipv4Control);
})();