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

// GET USERS
app.get('/user', async (req, res) => {
  let results, fields

  try {
    [results, fields] = await connection.query(`select * from user where user_id_auth0 like "${req.query.id}"`)
  } catch(err) {
    console.log(err)
  }

  res.send({ results })
})

// ADD NEW USER
app.post('/user', async (req, res) => {
  let results, fields

  try {
    [results, fields] = await connection.query(`insert into user (user_id_auth0) values ("${req.query.id}")`)
  } catch(err) {
    console.log(err)
  }

  res.send({ results })
})

// GET ALL USER'S RECEIPTS
app.put('/receipt', async (req, res) => {
  let results, fields

  try {
    [results, fields] = await connection.query(`
      SELECT receipt.id, receipt.created_at, receipt.date, shop.name, shop.logo 
      FROM receipt 
      INNER JOIN shop ON receipt.shop_id = shop.id 
      WHERE user_id = (
        SELECT id FROM user WHERE user_id_auth0 = "${req.body.userId}"
      )`)
  } catch(err) {
    console.log(err)
  }

  res.send({ results })
})

// ADD A NEW RECEIPT
app.post('/receipt', async (req, res) => {
  let results, fields

  try {
    [results, fields] = await connection.query(`insert into receipt (user_id) values (
      (select id from user where user_id_auth0 = "${req.body.userId}")
    )`)
  } catch (err) {
    console.log(err)
  }

  res.send({ results })
})

// EDIT RECEIPT
app.patch('/receipt', async (req, res) => {
  let results, fields

  try {
    [results, fields] = await connection.query(`update receipt set shop_id=${req.body.shopId} where id="${req.body.receiptId}"`)
  } catch (err) {
    console.log(err)
  }

  res.send({ results })
})

// REMOVE A RECEIPT
app.delete('/receipt', async (req, res) => {
  let results, fields

  console.log('req', req.body)
  console.log("user_id", req.body.userId, "id", req.body.receiptId)

  try {
    [results, fields] = await connection.query(`delete from receipt where user_id = (
        select id from user where user_id_auth0 = "${req.body.userId}") and id = "${req.body.receiptId}"
    `)
  } catch (err) {
   console.log(err)
  }

  res.send({ results })
})

// GET USER'S SHOPS
app.put('/shops', async (req, res) => {
  let results
  console.log('looking for', req.body.userId)

  try {
    let uid = await connection.query(`
      SELECT id 
      FROM user 
      WHERE user_id_auth0 = "${req.body.userId}"
    `)

    // console.log('uid is', uid[0][0].id)

    results = await connection.query(`
      SELECT shop_id, name, logo 
      FROM shoplist 
      INNER JOIN shop 
      ON shoplist.shop_id = shop.id 
      WHERE user_id = 20
    `)

  } catch (err) {
    console.log(err)
  }
  
  res.send({ results })
})

// GET SHOP
app.put('/shop', async (req, res) => {
  let results

  try {
    results = await connection.query(`
      SELECT id, name, logo
      FROM shop
      WHERE id = ${req.body.shopId}
    `)
  } catch (err) {
    console.log(err)
  }

  res.send({ results })
})

app.listen(process.env.PORT || 8081)