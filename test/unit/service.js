import { Service } from '../../src/service';

describe('Service', function () {
  let myService;
  beforeEach(function () {
    const MyService = class extends Service {
      static get requests () {
        return {
          foo: 'foo',
          bar: 'bar2'
        };
      }

      foo () {}
      bar2 () {}
    };

    myService = new MyService();

    spy(myService, 'setup');
    spy(myService, 'start');
    spy(myService, 'onError');
    stub(myService, 'foo');
    spy(myService, 'bar2');
  });

  it('should bind requests where the key and value match', function () {
    return myService.request('foo').then(() => {
      expect(myService.foo).to.have.been.calledOnce;
    });
  });

  it('should bind requests where the key and value don\'t match', function () {
    return myService.request('bar').then(() => {
      expect(myService.bar2).to.have.been.calledOnce;
    });
  });

  it('should call start() before calling the function', function () {
    return myService.request('foo').then(() => {
      expect(myService.start).to.have.been.calledBefore(myService.foo);
    });
  });

  it('should only call start() once', function () {
    return Promise.all([
      myService.request('foo'),
      myService.request('bar')
    ]).then(() => {
      expect(myService.start).to.have.been.calledOnce;
    });
  });

  it('should call onError when a request errors', function () {
    const error = new Error('Err!');
    myService.foo.throws(error);

    return myService.request('foo').then(() => {
      expect(myService.foo).to.have.thrown(error);
    }, (err) => {
      expect(err).to.equal(error);
      expect(myService.onError).to.have.been.calledWith(error);
    });
  });
});
