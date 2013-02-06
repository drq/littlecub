(function() {
    "use strict";

    LittleCub.HiddenControl = LittleCub.TextControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["helper"] = "";
                this.configs["label"] = "";
            }
        }, {
            TYPE : "hidden"
        }
    );

    LittleCub.controlClass(LittleCub.HiddenControl.TYPE, LittleCub.HiddenControl);
})();