const todoRouter = require('express').Router();
const pool = require('../db');
const authorizeToken = require('../middleware/authorizeToken');

todoRouter.get('/', authorizeToken, async (req, res) => {
	const { user, query } = req;

	let queryString = `SELECT * FROM todos WHERE u_id = $1`;

	if (query.sort === 'date') {
		queryString += ' ORDER BY due_date ASC';
	}
	else if (query.sort === 'name') {
		queryString += ' ORDER BY task ASC';
	}
	else if (query.sort === 'priority') {
		queryString += ' ORDER BY priority DESC';
	}

	try {
		const result = await pool.query(queryString, [ user.id ]);

		const todos = result.rows;

		res.json(todos);
	} catch (e) {
		res.json(500).send({ errMsg: 'failure' });
	}
});

todoRouter.post('/', authorizeToken, async (req, res) => {
	const body = req.body;
	const user = req.user;

	try {
		const result = await pool.query(
			`
      INSERT INTO todos
      (task, completed, priority, u_id, due_date, p_id)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
			[ body.task, false, body.priority, user.id, body.due_date, body.p_id ]
		);

		const createdTodo = result.rows[0];

		res.status(200).json(createdTodo);
	} catch (e) {
		console.log(e);
		res.status(400).json({ error: e });
	}
});

todoRouter.put('/:id', authorizeToken, async (req, res) => {
	const { id } = req.params;
	const body = req.body;

	try {
		const result = await pool.query(
			`
      SELECT * FROM todos WHERE t_id=$1
    `,
			[ id ]
		);

		if (result.rows.length === 0) {
			res.status(404).json({ errMsg: 'That todo item does not exist' });
		}

		const updatedTodo = await pool.query(
			`
      UPDATE todos
      SET task = $1, completed=$2, priority=$3, due_date=$4, p_id=$5
      WHERE t_id=$6
      RETURNING * 
    `,
			[ body.task, body.completed, body.priority, body.due_date, body.p_id, id ]
		);

		res.json(updatedTodo.rows[0]);
	} catch (e) {
		res.status(400).json({ errMsg: 'something happened' });
	}
});

todoRouter.delete('/:id', authorizeToken, async (req, res) => {
	const { id } = req.params;

	try {
		const result = await pool.query(
			`
    DELETE FROM todos 
    WHERE t_id=$1
    RETURNING *
  `,
			[ id ]
		);

		const deletedTodo = result.rows[0];

		res.json(deletedTodo);
	} catch (e) {
		res.status(400).json({ errMsg: 'something happened' });
	}
});

module.exports = todoRouter;
