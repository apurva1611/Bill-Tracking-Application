var StatsD = require('node-statsd'),
client = new StatsD();
module.exports = client;