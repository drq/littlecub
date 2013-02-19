(function() {
    "use strict";

    LittleCub["defaults"]["theme"] = "foundation";

    LittleCub.registerTheme({
        "id" : "foundation",
        "title" : "Zurb Foundation",
        "description" : "Default Zurb Foundation theme for rendering forms.",
        "parent" : "base",
        "errorInjection" : function(status) {
            var errorClass= "error";
            if (status) {
                $(this.outerEl).removeClass(errorClass);
            } else {
                $(this.outerEl).addClass(errorClass);
            }
        }
    });

    LittleCub.registerTheme({
        "id" : "foundation-horizontal",
        "parent" : "foundation",
        "title" : "Zurb Foundation Horizontal",
        "description" : "Zurb Foundation theme for rendering basic forms with horizontal styles."
    });

}());