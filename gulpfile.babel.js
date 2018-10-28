import gulp  from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import del  from 'del';
import path  from 'path';
import {Instrumenter} from 'isparta';

import _ from 'underscore';
import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';
import fs from 'fs';
import mkdirp from 'mkdirp';

import mochaGlobals from './test/setup/.globals';
import manifest  from './package.json';

// Load all of our Gulp plugins
const $ = loadPlugins();

// Gather the library data from `package.json`
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const destinationFolder = path.dirname(mainFile);
const exportFileName = path.basename(mainFile, path.extname(mainFile));

const preset = [
  'env',
  {
    modules: false,
    targets: {
      browsers: ['ie 11']
    },
    exclude: ['babel-plugin-transform-es2015-typeof-symbol']
  }
];

function cleanDist(done) {
  del([destinationFolder]).then(() => done());
}

function cleanTmp(done) {
  del(['tmp']).then(() => done());
}

function onError() {
  $.util.beep();
}

function getBanner() {
  var banner = '// Backbone.Radio v<%= version %>\n';
  return _.template(banner)(manifest);
}

function buildESModule(bundle) {
  return bundle.write({
    format: 'es',
    dest: manifest.module,
    sourceMap: true,
    banner: getBanner()
  }).then(function(gen) {
    return gen;
  }).catch(function(error) {
    console.log(error);
  });
}

function build(done) {
  rollup({
    entry: path.join('src', config.entryFileName),
    external: ['underscore', 'backbone'],
    plugins: [
      babel({
        sourceMaps: true,
        presets: [preset],
        babelrc: false
      })
    ]
  }).then(function(bundle) {
    buildESModule(bundle);
    var result = bundle.generate({
      banner: getBanner(),
      format: 'umd',
      sourceMap: 'inline',
      globals: {
        underscore: '_',
        backbone: 'Backbone'
      },
      sourceMapSource: config.entryFileName + '.js',
      sourceMapFile: exportFileName + '.js',
      moduleName: config.mainVarName
    });
    var code = _.template(result.code.toString())(manifest) +
          `\n//# sourceMappingURL=./${exportFileName}.js.map`;

    // Write the generated sourcemap
    mkdirp.sync(destinationFolder);
    fs.writeFileSync(path.join(destinationFolder, exportFileName + '.js'), code);
    fs.writeFileSync(path.join(destinationFolder, `${exportFileName}.js.map`), result.map.toString());

    $.file(exportFileName + '.js', code, { src: true })
      .pipe($.plumber())
      .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.sourcemaps.write('./', {addComment: false}))
      .pipe(gulp.dest(destinationFolder))
      .pipe($.filter(['*', '!**/*.js.map']))
      .pipe($.rename(exportFileName + '.min.js'))
      .pipe($.sourcemaps.init({ loadMaps: true }))
      .pipe($.uglify())
      .pipe($.header(getBanner()))
      .pipe($.sourcemaps.write('./'))
      .pipe(gulp.dest(destinationFolder))
      .on('end', done);
  }).catch(console.error);
}

function _mocha() {
  return gulp.src(['test/setup/node.js', 'test/unit/**/*.js'], {read: false})
    .pipe($.mocha({
      reporter: 'dot',
      globals: Object.keys(mochaGlobals.globals),
      ignoreLeaks: false
    }));
}

function _registerBabel() {
  require('babel-core/register');
}

function test() {
  _registerBabel();
  return _mocha();
}

function coverage(done) {
  _registerBabel();
  gulp.src(['src/**/*.js'])
    .pipe($.istanbul({ instrumenter: Instrumenter }))
    .pipe($.istanbul.hookRequire())
    .on('finish', () => {
      return test()
        .pipe($.istanbul.writeReports())
        .on('end', done);
    });
}


// Remove the built files
gulp.task('clean', cleanDist);

// Remove our temporary files
gulp.task('clean-tmp', cleanTmp);

// Build two versions of the library
gulp.task('build', ['clean'], build);

// Set up coverage and run tests
gulp.task('coverage', [], coverage);

// An alias of build
gulp.task('default', ['build']);
