import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'expensiva'
})

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

app.get('/status', async (req, res) => {
  let results, fields

  try {
    [results, fields] = await connection.query('select * from user')

    console.log(results)
  } catch (err) {
    console.log(err)
  }

  res.send({
    message: 'hello world',
    results
  })
})

app.get('/user', async (req, res) => {
  let results, fields

  try {
    [results, fields] = await connection.query(`select * from user where user_id_auth0 like "${req.query.id}"`)
  } catch(err) {
    console.log(err)
  }

  res.send({ results })
})

app.post('/user', async (req, res) => {
  let results, fields

  try {
    [results, fields] = await connection.query(`insert into user (user_id_auth0) values ("${req.query.id}")`)
  } catch(err) {
    console.log(err)
  }

  res.send({ results })
})

app.listen(process.env.PORT || 8081)