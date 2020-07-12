const express = require('express');
const cors = require('cors');
const userRouter = require('./routes/users');
const { requestLogger } = require('./middleware/requestLogger');

const app = express();

app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.use('/api/users', userRouter);

module.exports = app;