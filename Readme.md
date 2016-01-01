hapi-limitd
============

hapi-limitd is an hapi plugin for auth0/limitd deamon.

This decorate the response (also the request, providing a way to read the informations) with three headers: `x-ratelimit-limit`, `x-ratelimit-remaining`, `x-ratelimit-reset`.


The hapi-limitd is developed by [720kb](http://720kb.net).

## Requirements

Node.js v5.0+
## Installation
```
$ npm install hapi-limitd --save
```
## Usage

Here is an example registering the plugin:
```js
server.register({
  'register': require('hapi-limitd'),
  'options': {
    'endpoint': 'limitd://localhost:9001',
    'bucket': 'user',
    'inRequestKey': 'info.received'
  }
}, err => {
  ...
```
The `options` map contains:
 - `endpoint`: limitd endpoint;
 - `bucket`: the bucket defined in limitd;
 - `inRequestKey`: the request key that identify the user.

If you want to enable the limiting count on routes you have to fill the `config.plugins.limitd` to true.

For example:

 ```js
 server.route({
   'method': 'GET',
   'path': '/ping',
   'handler': (request, reply) => {

     reply('pong');
   },
   'config': {
     'plugins': {
       'limitd': true
     }
   }
 });
 ```
## License

The MIT License (MIT)

Copyright (c) 2015 720kb.net

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
