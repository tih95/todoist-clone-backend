const projectRouter = require('express').Router();
const pool = require('../db');
const authorizeToken = require('../middleware/authorizeToken');

projectRouter.get('/', authorizeToken, async (req, res) => {
  const user = req.user;
  console.log('is there a user backend?', user);
  try {
    const result = await pool.query(`
      SELECT * FROM projects
      WHERE u_id = $1
    `, [user.id])

    const projects = result.rows;

    return res.json(projects);
  }
  catch(e) {
    console.log('error', e);
    return res.status(400).json(e);
  }
})

projectRouter.post('/', authorizeToken, async (req, res) => {
  const body = req.body;
  const user = req.user;

  try {
    const result = await pool.query(`
      INSERT INTO projects
      (name, u_id)
      VALUES ($1, $2)
      RETURNING *
    `, [body.name, user.id])

    const createdProject = result.rows[0];

    res.status(200).json(createdProject);
  }
  catch(e) {
    return res.status(400).json({ error: e });
  }
});

projectRouter.post('/:id/addTodo', authorizeToken, async (req, res) => {
  const { user, body } = req;
  const { id } = req.params;
  let due_date;

  if (!body.due_date) {
    due_date = null;
  }

  try {
    const result = pool.query(`
      INSERT INTO todos
      (task, completed, priority, u_id, due_date, p_id)
      VALUES
      ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [body.task, false, body.priority, user.id, due_date, id]);

    const createdTodo = result.rows[0];

    res.status(200).json(createdTodo);
  }
  catch(e) {
    res.status(400).json(e);
  }
})

module.exports = projectRouter;