import { Channel } from './channel';
import { once, each } from 'underscore';

const resolved = Promise.resolve();

/**
 * @class Service
 */

export class Service extends Channel {
  constructor (channelName) {
    super(channelName);
    const start = once(() => resolved.then(() => this.start()));
    const requests = this.constructor.requests;
    each(requests, (val, key) => {
      this.reply(key, (...args) => {
        const promise = start().then(() => this[val](...args));

        promise.catch(err => {
          this.onError(err);
        });

        return promise;
      });
    });
  }
  /**
   * @abstract
   * @method setup
   */
  setup () {}

  /**
   * @abstract
   * @method start
   */
  start () {}

  /**
   * @abstract
   * @method onError
   */
  onError () {}
}
