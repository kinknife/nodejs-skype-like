const server = require('./lib/server');
const fs = require('fs-extra');
const path = require('path');
// Data base connect
const configure = JSON.parse( fs.readFileSync(path.join(__dirname, 'config.json')));
server.run(configure);