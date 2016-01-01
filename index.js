/*global module,require*/
(function limitdHapiPlugin(module, require) {
  'use strict';

  const packageInformation = require('./package.json')
    , joi = require('joi')
    , optionsSchema = joi.object().keys({
        'endpoint': joi.string().min(15).required(),
        'bucket': joi.string().min(3).required(),
        'inRequestKey': joi.string().min(3).required()
      }).with('endpoint', 'bucket', 'inRequestKey')
    , LimitdClient = require('limitd-client')
    , parseRequestForKey = function parseRequestForKey(request, inRequestKey) {
      let partial = request;

      inRequestKey.split('.').forEach(element => {

        if (partial &&
          partial[element]) {

          partial = partial[element];
        } else {

          partial = undefined;
        }
      });

      return partial;
    }
    , limitdHapiPluginObject = (server, options, next) => {

      if (options) {

        joi.validate(options, optionsSchema, (err, value) => {

          if (err) {

            return next(new Error(err));
          }
          const limitd = new LimitdClient(value.endpoint);

          server.ext('onPreResponse', (request, reply) => {

            if (request.headers &&
              request.headers['X-RateLimit-Limit'] &&
              request.headers['X-RateLimit-Remaining'] &&
              request.headers['X-RateLimit-Reset']) {

              request.response.header('X-RateLimit-Limit', request.headers['X-RateLimit-Limit']);
              request.response.header('X-RateLimit-Remaining', request.headers['X-RateLimit-Remaining']);
              request.response.header('X-RateLimit-Reset', request.headers['X-RateLimit-Reset']);
            }

            reply.continue();
          });

          server.ext('onPostAuth', (request, reply) => {

            if (request.route.settings.plugins &&
              !request.route.settings.plugins.limitd) {

              return reply.continue();
            }

            let valueInRequest = parseRequestForKey(request, value.inRequestKey);

            if (!valueInRequest) {

              return reply({
                'cause': `request.${value.inRequestKey} does not exists`
              }).code(502);
            }

            limitd.take(value.bucket, String(valueInRequest), (limitdErr, limitdResponse) => {

              if (limitdErr) {

                return reply({
                  'cause': `limitd error: ${limitdErr.message}`
                }).code(502);
              }

              request.headers = request.headers || {};
              request.headers['X-RateLimit-Limit'] = limitdResponse.limit;
              request.headers['X-RateLimit-Remaining'] = limitdResponse.remaining;
              request.headers['X-RateLimit-Reset'] = limitdResponse.reset;

              if (limitdResponse.conformant) {

                return reply.continue();
              }

              reply()
                .code(429);
            });
          });
          next();
        });
      } else {

        next(new Error(`You must specify the options`));
      }
    };

  limitdHapiPluginObject.attributes = {
    'name': packageInformation.name,
    'version': packageInformation.version
  };

  module.exports = {
    'register': limitdHapiPluginObject
  };
}(module, require));
