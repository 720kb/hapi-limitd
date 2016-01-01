/*global module,require*/
(function testing(module, require) {
  'use strict';

  const code = require('code')
    , lab = require('lab').script()
    , describe = lab.describe
    , it = lab.it
    , before = lab.before
    , expect = code.expect
    , Hapi = require('hapi')
    , hapiLimitd = require('..');

  describe('hapi-limitd plugin does not load due missing configurations', () => {
    let server;

    before(done => {

      server = new Hapi.Server();
      server.connection({
        'host': '::1',
        'port': 3000
      });
      done();
    });

    it('should fail on register', done => {

      server.register(hapiLimitd, err => {

        expect(err).to.be.not.undefined();
        expect(err).to.be.instanceof(Error);
        done();
      });
    });
  });

  describe('hapi-limitd plugin does load but inRequestKey is not present', () => {
    let server;

    before(done => {

      server = new Hapi.Server();
      server.connection({
        'host': '::1',
        'port': 3000
      });
      done();
    });

    before(done => {

      server.register({
        'register': hapiLimitd,
        'options': {
          'endpoint': 'limitd://localhost:9001',
          'bucket': 'user',
          'inRequestKey': 'auth.credentials.id'
        }
      }, err => {

        if (err) {

          throw new Error(err.message);
        }

        server.route({
          'method': 'GET',
          'path': '/ping',
          'handler': (request, reply) => {

            reply('pong');
          }
        });
      });

      server.start(() => {

        done();
      });
    });

    it('should trigger the hapi-limitd plugin but reply with an error', (done) => {
      let options = {
        'method': 'GET',
        'url': '/ping'
      };

      server.inject(options, (response) => {

        expect(response.statusCode).to.equal(502);
        expect(response.payload).to.be.equal('{"cause":"request.auth.credentials.id does not exists"}');
        done();
      });
    });
  });

  describe('hapi-limitd plugin does load and reply with headers', () => {
    let server;

    before(done => {

      server = new Hapi.Server();
      server.connection({
        'host': '::1',
        'port': 3000
      });
      done();
    });

    before(done => {

      server.register({
        'register': hapiLimitd,
        'options': {
          'endpoint': 'limitd://localhost:9001',
          'bucket': 'user',
          'inRequestKey': 'info.received'
        }
      }, err => {

        if (err) {

          throw new Error(err.message);
        }

        server.route({
          'method': 'GET',
          'path': '/ping',
          'handler': (request, reply) => {

            reply('pong');
          }
        });
      });

      server.start(() => {

        done();
      });
    });

    it('should trigger the hapi-limitd plugin', (done) => {
      let options = {
        'method': 'GET',
        'url': '/ping'
      };

      server.inject(options, (response) => {

        expect(response.statusCode).to.equal(200);
        expect(response.payload).to.be.equal('pong');
        expect(response.headers).to.be.an.object();
        expect(response.headers).to.include(['x-ratelimit-limit', 'x-ratelimit-remaining', 'x-ratelimit-reset']);
        done();
      });
    });
  });

  module.exports = {
    'lab': lab
  };
}(module, require));
