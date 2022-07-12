const cluster = require('cluster')
const { verifyEmail } = require('./context/events/calls/SendMail')
const Mailer = require('./posgoose/Mailer')
// const os_length = require('os').cpus().length
const os_length = 1

if (cluster.isMaster) {
  for (let i = 0; i < os_length; i++) {
    cluster.fork()
  }
} else {
  const express = require('express')
  const app = express()
  const expressUploads = require('express-fileupload')
  const expressSanitizer = require('express-sanitizer')
  const cookieParser = require('cookie-parser')
  const helmet = require('helmet')
  const cors = require('cors')
  const colors = require('colors')
  const path = require('path')
  const dotenv = require('dotenv')
  const logger = require('./middleware/logger')
  const errorHandler = require('./middleware/errorHandler')
  const map = require('./routes/map')
  const user = require('./routes/user')
  const disco = require('./routes/disco')
  const form74 = require('./routes/form74')
  const order = require('./routes/order')

  // .ENV PATH
  dotenv.config({ path: 'config/.env' })

  // Body Parser Json
  app.use(express.json())

  // Initializing Middleware
  //Middleware
  app.use(logger)
  app.use(cors())
  app.use(cookieParser())
  app.use(expressUploads())
  app.use(helmet())
  app.use(expressSanitizer())

  // File paths for all uploads
  app.use('/public', express.static(path.join(__dirname, 'public')))

  app.get('/html-form', async (req, res) => {
    const htm = path.join(__dirname, 'public', 'html', 'form.html')
    await verifyEmail(req)
    res.sendFile(htm)
  })

  //Initialize All Created Routes
  app.use('/api/v1/map', map)
  app.use('/api/v1/disco', disco)
  app.use('/api/v1/user', user)
  app.use('/api/v1/form74', form74)
  app.use('/api/v1/order', order)

  // Welcome Displays
  app.use(express.static(path.join(__dirname, 'client', 'build')))
  // GET all routes not defined;
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  )

  // Catch All possible error
  app.use(errorHandler)

  const PORT = process.env.PORT || 5500

  app.listen(PORT, () =>
    console.log(`App running on URL: http://localhost:${PORT}`.yellow.bold)
  )
}

cluster.on('exit', (worker) => {
  cluster.fork()
})

// Main()
