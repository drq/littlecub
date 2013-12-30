(function() {
    "use strict";

    LittleCub["defaults"]["theme"] = "bootstrap2";

    LittleCub.registerTheme({
        "id" : "bootstrap2",
        "title" : "Twitter Bootstrap 2",
        "description" : "Default Twitter bootstrap 2.x theme for rendering basic forms.",
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
        "id" : "bootstrap2-horizontal",
        "parent" : "bootstrap2",
        "title" : "Twitter Bootstrap 2 Horizontal",
        "description" : "Twitter bootstrap 2.x theme for rendering basic forms with horizontal styles."
    });

}());