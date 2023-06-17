require('dotenv').config();
require('express-async-errors');
const mongoose = require('mongoose');
const express = require('express');
const connectDB = require('./config/dbConn');
const corsOptions = require('./config/corsOptions');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const rateLimit = require('express-rate-limit');


const app= express();
const PORT = 5000;

connectDB();

const limiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 5,
    handler: (req, res, next) => {
        console.log('Rate limit exceeded!! increase limit in index.js');
    } 
});
app.use(limiter);
app.use(logger);
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions))

app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));
app.use('/reels', require('./routes/reels'));
app.use('/stories', require('./routes/stories'));
app.use('/chats', require('./routes/chats'));
app.use('/posts', require('./routes/posts'));
app.use('/followers', require('./routes/followers'));
app.use('/cloudinary', require('./routes/cloudinary'));


app.all('*', (req, res) => {
    res.status(404)
    if (req.accepts('json')) {
        res.json({ message: '404 Not Found' });
    } else {
        res.type('txt').send('404 Not Found');
    }
});

app.use(errorHandler);



mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

mongoose.connection.on('error', err => {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
});

