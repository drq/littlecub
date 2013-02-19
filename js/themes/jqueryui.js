(function() {
    "use strict";

    LittleCub["defaults"]["theme"] = "jqueryui";

    LittleCub.registerTheme({
        "id" : "jqueryui",
        "parent" : "base",
        "title" : "jQuery UI",
        "description" : "Default jQuery UI theme for rendering basic forms.",
        "errorClass" : "ui-state-error",
        "injection" : function(container) {
            $("button,input[type=button],input[type=submit],input[type=reset]", container).button().wrap("<small></small>");
        }
    });

    LittleCub.registerTheme({
        "id" : "jqueryui-horizontal",
        "parent" : "jqueryui",
        "title" : "jQuery UI Horizontal",
        "description" : "Default jQuery UI theme for rendering basic forms with helpers and labels on the same line as their mapped control."
    });

}());