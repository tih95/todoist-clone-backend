const userRouter = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config');
const pool = require('../db');

userRouter.post('/signup', async (req, res) => {
  const body = req.body;

  try {
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);
    const result = await pool.query(`
      INSERT INTO users
      (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [body.name, body.email, passwordHash])

    if (result.rows > 0) {
      return res.status(400).json({ err: 'User already exists' });
    }

    const retUser = result.rows[0];

    const userForToken = {
      id: retUser.id
    }

    const token = jwt.sign(userForToken, config.JWT_SECRET);

    res.status(200).json({ token, name: retUser.name, email: retUser.email });
  }
  catch(e) {
    console.log('error detail', e.detail);
    res.status(400).json({ msg: 'hello' })
  }
})

userRouter.post('/login', async (req, res) => {
  const body = req.body;

  try {
    const result = await pool.query(`
      SELECT * FROM users
      WHERE email = $1
    `, [body.email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'User does not exist' });
    }

    const loggedInUser = result.rows[0];
    const passwordCorrect = await bcrypt.compare(body.password, loggedInUser.password_hash);

    if (passwordCorrect) {
      const userForToken = {
        id: loggedInUser.id
      }

      const token = jwt.sign(userForToken, config.JWT_SECRET);

      res.status(200).json({ token, name: loggedInUser.name, email: loggedInUser.email });
    }
    else {
      return res.status(400).json({ error: 'Password is incorrect' })
    }
  }
  catch(e) {
    res.status(400).json({ error: 'Log In failed' })
  }
})

module.exports = userRouter;