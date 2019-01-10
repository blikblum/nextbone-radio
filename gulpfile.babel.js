import gulp  from 'gulp';
import loadPlugins from 'gulp-load-plugins';
import del  from 'del';
import path  from 'path';

import _ from 'underscore';
import {rollup} from 'rollup';
import babel from 'rollup-plugin-babel';

import manifest  from './package.json';

// Load all of our Gulp plugins
const $ = loadPlugins();

// Gather the library data from `package.json`
const config = manifest.babelBoilerplateOptions;
const mainFile = manifest.main;
const destinationFolder = path.dirname(mainFile);

const preset = [
  'env',
  {
    modules: false,
    targets: {
      browsers: ['chrome 60']
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

function getBanner() {
  var banner = '// Nextbone.Radio v<%= version %>\n';
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

function build() {
  rollup({
    entry: path.join('src', config.entryFileName),
    external: ['underscore', 'nextbone'],
    plugins: [
      babel({
        sourceMaps: true,
        presets: [preset],
        babelrc: false
      })
    ]
  }).then(buildESModule).catch(console.error);
}

// Remove the built files
gulp.task('clean', cleanDist);

// Remove our temporary files
gulp.task('clean-tmp', cleanTmp);

// Build two versions of the library
gulp.task('build', ['clean'], build);

// An alias of build
gulp.task('default', ['build']);
