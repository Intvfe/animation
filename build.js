module.exports = {

    // if to compress images. switch to true if there are new images or false to speed up building.
    imagemin : false,

    // js files that will be concatenated with main.js
    bundles: [
        './views/base.js'
    ],

    pathBuilder: [ '_buildTextPath', '_buildTextPath2' ],

    // the cdn path of the current project
    cdnPath: ''

}
