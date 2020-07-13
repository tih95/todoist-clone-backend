const projectRouter = require('express').Router();
const pool = require('../db');

projectRouter.post('/', async (req, res) => {
  const body = req.body;

  try {
    const result = await pool.query(`
      INSERT INTO projects
      (name, u_id)
      VALUES ($1, $2)
      RETURNING *
    `, [body.name, body.u_id])

    const createdProject = result.rows[0];

    res.status(200).json(createdProject);
  }
  catch(e) {
    return res.status(400).json({ error: e });
  }
})

module.exports = projectRouter;