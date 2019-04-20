'use strict'

const del = require('del')
const rollup = require('rollup')
const pkg = require('../package.json')
const _ = require('underscore')


let promise = Promise.resolve()

let dependencies = Object.assign({}, pkg.dependencies || {}, pkg.peerDependencies || {})

function getBanner() {
  var banner = '// Nextbone.Radio v<%= version %>\n';
  return _.template(banner)(pkg);
}

// Clean up the output directory
promise = promise.then(() => del(['dist/*']))

// Compile source code into a distributable format with Babel
for (const format of ['es']) {
  promise = promise.then(() => rollup.rollup({
    input: 'src/index.js',
    external: Object.keys(dependencies),
    plugins: []
  }).then(bundle => bundle.write({
    file: `dist/nextbone-radio.js`,
    format,
    sourcemap: true,
    banner: getBanner()
  })))
}

promise.catch(err => {
  console.error(err.stack) // eslint-disable-line no-console
  process.exit(1)
}).then(() => {
  console.log('Build finished')  
})
