(function () {
    "use strict";

    LittleCub["defaults"]["theme"] = "jqueryui";

    LittleCub.registerTheme({
        "id":"jqueryui",
        "parent":"base",
        "title":"jQuery UI",
        "description":"Default jQuery UI theme for rendering basic forms.",
        "errorClass":"ui-state-error",
        "injection":function (container) {
            $("button,input[type=button],input[type=submit],input[type=reset]", container).button().wrap("<small></small>");
            $("button.lc-array-add").button({
                "icons":{
                    "primary":"ui-icon-circle-plus"
                }
            });
            $("button.lc-array-item-add").button({
                "icons":{
                    "primary":"ui-icon-circle-plus"
                },
                "text":false
            });
            $("button.lc-array-item-remove").button({
                "icons":{
                    "primary":"ui-icon-circle-minus"
                },
                "text":false
            });
            $( ".lc-array-item-toolbar" ).buttonset().wrap("<small></small>");
        }
    });

    LittleCub.registerTheme({
        "id":"jqueryui-horizontal",
        "parent":"jqueryui",
        "title":"jQuery UI Horizontal",
        "description":"Default jQuery UI theme for rendering basic forms with helpers and labels on the same line as their mapped control."
    });

}());