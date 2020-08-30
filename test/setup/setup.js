module.exports = function() {
  global._ = require('lodash-es');
  global.Backbone = require('nextbone');
  global.expect = global.chai.expect;
  global.slice = Array.prototype.slice;
  var {Radio, Channel, logger} = require('../../src/index');
  Radio.Channel = Channel;
  Radio.logger = logger;
  global.Radio = Radio;
  global.Backbone.Radio = Radio;

  beforeEach(function() {
    this.sinon = global.sinon.createSandbox();
    global.stub = this.sinon.stub.bind(this.sinon);
    global.spy  = this.sinon.spy.bind(this.sinon);
  });

  afterEach(function() {
    global.Backbone.Radio.DEBUG = false;
    global.Backbone.Radio.reset();
    delete global.stub;
    delete global.spy;
    this.sinon.restore();
  });
};
