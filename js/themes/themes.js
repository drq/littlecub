(function() {
    "use strict";

    LittleCub.registerTheme({
        "id" : "default",
        "title" : "Default Them",
        "description" : "Default theme for rendering basic forms.",
        "templateEngine":"handlebars",
        "platform":["web"],
        "style":"jquery-ui"
    });

    LittleCub.registerTheme({
        "id" : "default-inline",
        "parent" : "default",
        "title" : "Default Inline Style Theme",
        "description" : "Default theme for rendering basic forms with inline styles."
    });
}());