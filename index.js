const Main = require('./config/Main')
const cluster = require('cluster')
const os_length = require('os').cpus().length

if (cluster.isMaster) {
  for (let i = 0; i < os_length; i++) {
    cluster.fork()
  }
} else {
  Main()
}

cluster.on('exit', (worker) => {
  cluster.fork()
})

// Main()
