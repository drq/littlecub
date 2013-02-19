(function() {
    "use strict";

    LittleCub["defaults"]["theme"] = "bootstrap";

    LittleCub.registerTheme({
        "id" : "bootstrap",
        "title" : "Twitter Bootstrap",
        "description" : "Default Twitter bootstrap theme for rendering basic forms.",
        "parent" : "base",
        "errorInjection" : function(status) {
            var errorClass= "control-group error";
            if (status) {
                $(this.outerEl).removeClass(errorClass);
            } else {
                $(this.outerEl).addClass(errorClass);
            }
        }
    });

    LittleCub.registerTheme({
        "id" : "bootstrap-horizontal",
        "parent" : "bootstrap",
        "title" : "Twitter Bootstrap Horizontal",
        "description" : "Twitter bootstrap theme for rendering basic forms with horizontal styles."
    });

}());