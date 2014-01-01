LittleCub Forms
===============

LittleCub is a light-weight, high-performance, easily customizable forms engine for Node.js and browser. It comes with comprehensive form control library and support for various responsive and mobile UI frameworks and can be easily customized or extended for additional framework support or custom controls.

Installing
----------

Add required dependencies to your web page

* [Underscore](http://underscorejs.org/) for utility functions

* [Handlebar](http://handlebarsjs.com/) for templating.

```
<script type="text/javascript" src="http://builds.handlebarsjs.com.s3.amazonaws.com/handlebars.runtime-v1.2.0.js"></script>
<script type="text/javascript" src="http://underscorejs.org/underscore-min.js"></script>
```

After the two dependencies, add one of the following LittleCub theme libraries depends on which UI framework you choose.

You may also need to add the required libraries and stylesheets for your selected framework.

```
<!-- Basic Theme with no fancy stuff -->
<script src="http://drq.github.io/littlecub/releases/trunk/littlecub.min.js" type="text/javascript"></script>

<!-- Twitter Bootstrap 3.x -->
<script src="http://drq.github.io/littlecub/releases/trunk/littlecub-bootstrap.min.js" type="text/javascript"></script>

<!-- Twitter Bootstrap 2.x -->
<script src="http://drq.github.io/littlecub/releases/trunk/littlecub-bootstrap2.min.js" type="text/javascript"></script>

<!-- jQuery Mobile Foundation -->
<script src="http://drq.github.io/littlecub/releases/trunk/littlecub-jquerymobile.min.js" type="text/javascript"></script>

<!-- jQuery UI -->
<script src="http://drq.github.io/littlecub/releases/trunk/littlecub-jqueryui.min.js" type="text/javascript"></script>

<!-- Zurb Foundation -->
<script src="http://drq.github.io/littlecub/releases/trunk/littlecub-foundation.min.js" type="text/javascript"></script>
```

Usage
-----

In general, LittleCub takes a JSON data document with a matched JSON Schema document and produce an HTML form
within the container DOM element that your provide.

You can also provide an additional configs JSON document that contains all control related settings such as
control type, size of text field etc.

Depending on your use case, you may only need to provide one of the three JSON documents or any combination of the three.

```
// Renders an array control with a dynamic list of text controls.
var arrayControl1 = LittleCub(["Sample1","S",""], {
    "type" : "array",
    "items" : {
        "type" : "text",
        "label": "Sample",
        "placeholder" : "Enter some text"
    }
}, {
    "type" : "array",
    "items" : {
        "type" : "string",
        "minLength" : 4
    }
},document.getElementById('array-control-1'));

// Validate the new array control and its children
arrayControl1.validate(true);
```

jQuery is not required for LittleCub although it comes with support for it.

```
// Renders the same array control with a dynamic list of text controls using jQuery.
$('#array-control-2').lc(["Sample1","S",""], {
    "type" : "array",
    "items" : {
        "type" : "text",
        "label": "Sample",
        "placeholder" : "Enter some text"
    }
}, {
    "type" : "array",
    "items" : {
        "type" : "string",
        "minLength" : 4
    }
}).validate(true);
```

Building
--------

To build LittleCub, you'll need have [npm](https://npmjs.org/‎) and [Grunt](http://gruntjs.com/getting-started) installed.

Project dependencies can be installed via `npm install --save-dev`.

To build LittleCub from scratch, you'll want to run `grunt`
in the root of the project. That will build LittleCub and output the
results to the dist/ folder.

To run the unit tests, run `grunt test` in the project root.

The `grunt connect` allows you to check out LittleCub documentation and samples at `http://localhost:9001/docs/`.

License
-------

LittleCub is released under the Apache 2 license.
