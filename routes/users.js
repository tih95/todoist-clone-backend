const userRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const pool = require('../db');
const authorizeToken = require('../middleware/authorizeToken');

userRouter.post('/register', async (req, res) => {
	const body = req.body;

	try {
		const user = await pool.query(
			`
      SELECT * FROM users
      WHERE email = $1
    `,
			[ body.email ]
		);

		if (user.rows.length > 0) {
			return res.status(401).json({ errMsg: 'Account already exists' });
		}

		const saltRounds = 10;
		const passwordHash = await bcrypt.hash(body.password, saltRounds);

		// begin transaction of creating a user and a default Inbox project
		await pool.query('BEGIN');

		const result = await pool.query(
			`
      INSERT INTO users
      (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING *
    `,
			[ body.name, body.email, passwordHash ]
		);

		const retUser = result.rows[0];

		// automatically creates a new project 'inbox'
		await pool.query(
			`
    INSERT INTO projects
    (name, u_id, color)
    VALUES ('inbox', $1, '#000')
  `,
			[ retUser.u_id ]
		);

		await pool.query('COMMIT');
		const userForToken = {
			id: retUser.u_id
		};

		const token = jwt.sign(userForToken, config.JWT_SECRET);

		res.status(200).json({ token, name: retUser.name, email: retUser.email });
	} catch (err) {
		res.status(500).send({ err });
	}
});

userRouter.post('/login', async (req, res) => {
	const body = req.body;
	
	try {
		const result = await pool.query(
			`
      SELECT * FROM users
      WHERE email = $1
    `,
			[ body.email ]
		);

		if (result.rows.length === 0) {
			return res.status(401).json({ errMsg: 'User account does not exist' });
		}

		const loggedInUser = result.rows[0];
		const passwordCorrect = await bcrypt.compare(body.password, loggedInUser.password_hash);

		if (passwordCorrect) {
			const userForToken = {
				id: loggedInUser.u_id
			};

			const token = jwt.sign(userForToken, config.JWT_SECRET);

			res.status(200).json({ token, name: loggedInUser.name, email: loggedInUser.email });
		}
		else {
			return res.status(400).json({ errMsg: 'Password is incorrect' });
		}
	} catch (err) {
		res.status(500).json({ err });
	}
});

userRouter.put('/password', authorizeToken, async (req, res) => {
	const user = req.user;
	const body = req.body;

	try {
		const saltRounds = 10;
		const passwordHash = await bcrypt.hash(body.password, saltRounds);

		const result = await pool.query(`
			UPDATE users
			SET password_hash=$1
			RETURNING *
		`, [passwordHash]) 

		const editedUser = result.rows[0];

		res.json({editedUser});
	}
	catch(e) {
		res.status(400).json({errMsg: 'Could not update'})
	}
})

userRouter.put('/', authorizeToken, async (req, res) => {
	const user = req.user;
	const body = req.body;

	try {

		const userTaken = await pool.query(`
			SELECT * FROM users
			WHERE email = $1
		`
		, [body.email]
		)

		if (userTaken.rows.length > 0) {
			return res.status(400).json({errMsg: 'User is already taken'})
		}

		const result = await pool.query(`
			UPDATE users
			SET name=$1, email=$2
			WHERE u_id=$3
			RETURNING *
		`, [body.name, body.email, user.id])

		const editedUser = result.rows[0];

		const userForToken = {
			id: editedUser.u_id
		}

		const newToken = jwt.sign(userForToken, config.JWT_SECRET);

		res.json({ token: newToken, name: editedUser.name, email: editedUser.email})
	}
	catch(e) {
		res.status(400).json({errMsg: 'Could not update account'});
	}
})

module.exports = userRouter;
