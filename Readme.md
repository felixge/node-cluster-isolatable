# cluster-isolatable

Plugin for [cluster][] that allows to isolate one connection per worker.

It's not perfect because node always accepts as many connections as possible
when the server's fd becomes readable, but with a high enough worker count,
the chances of two connections making it into one worker are relatively small.

## Usage

``` javascript
var isolatable = require('cluster-isolatable');
cluster(server).use(isolatable());
```

## License

MIT

[cluster]: http://learnboost.github.com/cluster/
