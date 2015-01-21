var fs = require('fs'),
    strip = require('stripper').strip,
    uglifyjs = require('uglify-js'),
    root = __dirname + '/../',
    pkg = require(root + 'package.json'),
    ver = pkg.version,
    build = root + 'build/',
    buildv = build + ver + '/',
    out = build + 'util.js',
    outnode = build + 'util-node.js',
    outmin = buildv + 'util-min.js',
    srcin = root + 'src/util.js',
    src = fs.readFileSync(srcin, 'utf-8');

function min(src, opts) {
    return uglifyjs.minify(src, opts).code
}

try {
    var minOpts = {output: {comments: /Copyright/}},
        stripOpts = {path: srcin, preprocess: {NODE: false}},
        stripOptsNode = {path: srcin, preprocess: {NODE: true}},
        builds = [
            {path: out, src: strip(stripOpts)},
            {path: outmin, src: min(out, minOpts)},
            {path: outnode, src: strip(stripOptsNode)}
        ];

    // make build dir
    if (!fs.existsSync(buildv)) {
        fs.mkdirSync(buildv);
        console.log('Created dir ' + buildv);
    }

    // write each build file
    builds.forEach(function eachBuild(build) {
        var src = build.src;
        console.log('Writing ' + build.path + '...');
        fs.writeFileSync(build.path, typeof src === 'function' ? src() : src, 'utf-8');
    });
} catch (e) {
    console.log(e.stack);
    process.exit(1);
}

console.log('Done.');

