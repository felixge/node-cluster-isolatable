var clusterIsolatable = require('../');
var cluster = require('cluster');
var http = require('http');
var assert = require('assert');

var options = {
  host: 'localhost',
  port: 3000,
};

var server = http.createServer(function(req, res) {
  var timeout = parseInt(req.url.substr(1), 10);
  console.error('isolateWorker', timeout);
  master.isolateWorker(timeout);

  res.writeHead(200, {'X-Pid': process.pid});
  res.write('Hi');
});

var master = cluster(server)
  .set('workers', 1)
  .set('timeout', 1500)
  .use(clusterIsolatable())
  .listen(options.port);


var timeouts = [500, 1000];
var expectedTimeouts = [];

master.on('worker connected', function() {
  var timeout = timeouts.shift();
  if (!timeout) {
    return;
  }

  expectedTimeouts.push(timeout);
  options.path = '/' + timeout;
  http.get(options, function(res) {});
});

master.on('worker timeout', function(worker, timeout) {
  console.error('workerTimeout', timeout);

  var expected = expectedTimeouts.shift();
  assert.equal(timeout, expected);

  if (expectedTimeouts.length) {
    return;
  }

  assert.equal(master.children.length, 1);
  master.close();
});

process.on('exit', function() {
  assert.strictEqual(expectedTimeouts.length, 0);
});
