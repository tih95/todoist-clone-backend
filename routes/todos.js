const todoRouter = require('express').Router();
const pool = require('../db');
const authorizeToken = require('../middleware/authorizeToken');

todoRouter.get('/', authorizeToken, async (req, res) => {
  const user = req.user;

  try {
    const result = await pool.query(`
      SELECT * FROM todos
      WHERE u_id = $1
    `, [user.id]);

    const todos = result.rows;

    res.json(todos);
  }
  catch(e) {
    res.json(500).send({ errMsg: 'failure' });
  }
  
})

todoRouter.post('/', authorizeToken, async (req, res) => {
  const body = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO todos
      (task, completed, priority, u_id, due_date, p_id)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [body.task, body.completed, body.priority, body.u_id, body.due_date, body.p_id])
  
    const createdTodo = result.rows[0];

    res.status(200).json(createdTodo);
  }
  catch(e) {
    console.log(e);
    res.status(400).json({ error: e })
  }
  
})

module.exports = todoRouter;