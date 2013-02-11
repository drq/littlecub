(function() {
    "use strict";

    LittleCub.ListControl = LittleCub.BaseControl.extend({
            constructor: function(data, configs, schema) {
                this.base(data, configs, schema);
            },

            init: function() {
                this.base();
                this.configs["options"] = this.configs["options"] || [];
                var options = this.configs["options"];
                var that = this;
                var isArray = _.isArray(that.data);
                var enums = isArray && this.schema["items"] ? this.schema["items"]["enum"] : this.schema["enum"];

                if (enums) {
                    var _options = [];
                    _.each(enums, function(v, k) {
                        var text = v;
                        if (! LC.isEmpty(options[v])) {
                            text = options[v];
                        } else if (! LC.isEmpty(options[k])) {
                            text = options[k];
                        }
                        _options.push({
                            "value": v,
                            "text": text,
                            "selected": isArray ? _.contains(that.data, v) : that.data == v
                        });
                    });
                    this.configs["options"] = _options;
                }
            }
        }
    );

})();