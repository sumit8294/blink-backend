require('dotenv').config();
require('express-async-errors')
const mongoose = require('mongoose');
const express = require('express');
const connectDB = require('./config/dbConn');
const corsOptions = require('./config/corsOptions');
const cookieParser = require('cookie-parser');
const cors = require('cors')
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')

const app= express();
const PORT = 5000;

connectDB()

app.use(logger)
app.use(express.json())
app.use(cookieParser())
// app.use(cors(corsOptions))

app.use('/users', require('./routes/users'))
app.use('/auth', require('./routes/auth'))


app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('json')) {
        res.json({ message: '404 Not Found' })
    } else {
        res.type('txt').send('404 Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})