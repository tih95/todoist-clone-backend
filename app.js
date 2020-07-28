const express = require('express');
const cors = require('cors');
const todoRouter = require('./routes/todos');
const userRouter = require('./routes/users');
const projectRouter = require('./routes/projects');
const { requestLogger } = require('./middleware/requestLogger');

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use('/api/users', userRouter);
app.use('/api/todos', todoRouter);
app.use('/api/projects', projectRouter);

module.exports = app;