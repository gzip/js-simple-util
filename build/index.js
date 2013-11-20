var fs = require('fs'),
    strip = require('stripper').strip,
    uglifyjs = require('uglify-js'),
    root = __dirname + '/../',
    pkg = require(root + 'package.json'),
    ver = pkg.version,
    build = root + 'build/',
    buildv = build + ver + '/',
    out = buildv + 'util.js',
    outmin = buildv + 'util.min.js',
    outnode = build + 'util.node.js',
    srcin = root + 'src/util.js',
    src = fs.readFileSync(srcin, 'utf-8');

try {
    var builds = {};

    // assign path to content
    builds[out] = src;
    builds[outmin] = uglifyjs.minify(srcin, {output: {comments: /Copyright/}}).code;
    builds[outnode] = strip({path: srcin, preprocess: {NODE: true}});

    // make build dir
    if (!fs.existsSync(buildv)) {
        fs.mkdirSync(buildv);
        console.log('Created dir ' + buildv);
    }

    // write each build file
    for (var b in builds) {
        console.log('Writing ' + b + '...');
        fs.writeFileSync(b, builds[b], 'utf-8');
    }
} catch (e) {
    console.log(e.stack);
    process.exit(1);
}

console.log('Done.');

