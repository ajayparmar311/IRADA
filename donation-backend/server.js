require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const connectDB = require('./config/db')

const { logger, morganFormat } = require('./config/logger')
const morgan = require('morgan')

// HTTP request logging
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
)

// Add global error handler
process.on('unhandledRejection', (error) => {
  logger.error(`Unhandled rejection: ${error.stack}`)
})

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.stack}`)
  process.exit(1)
})

const app = express()

// Connect to Database
connectDB()

// Middleware
app.use(cors())
app.use(bodyParser.json())

// Routes
app.use('/api/v1', require('./routes/donationRoutes'))

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Donation API Running')
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
