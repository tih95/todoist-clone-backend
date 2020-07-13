const todoRouter = require('express').Router();
const e = require('cors');
const pool = require('../db');

todoRouter.get('/', (req, res) => {

})

todoRouter.post('/', async (req, res) => {
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