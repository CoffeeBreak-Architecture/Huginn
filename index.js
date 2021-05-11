const express = require('express')
const app = express()
const mysql = require('mysql2')
const port = 3011
const {v4:uuid} = require('uuid');

app.use(express.json());

const createTableQuery = 'CREATE TABLE IF NOT EXISTS rooms ('
 + 'id CHAR(36) PRIMARY KEY,'
 + 'ownerId CHAR(36),'
 + 'name VARCHAR(64),'
 + 'socketUrl VARCHAR(128),'
 + 'signallingUrl VARCHAR(128)'
 + ' )'

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

function initalizeDatabase () {
    console.log(createTableQuery)
    pool.query(createTableQuery, function(error, result, fields) {
        if (error) {
            console.error('Failed to initialize database.', error)
        }
        console.log('Succesfully initialized database!')
    })
}

app.get("/", (req, res) => {
    res.send("");
})

app.get('/rooms', function (req, res) {
    pool.query('SELECT * FROM rooms', (error, result, fields) => {
        if (error) {
            res.send(error, 500)
        }else{
            res.send(result)
        }
    })
})

app.get('/rooms/:roomId', function (req, res) {
    let roomId = req.params.roomId;
    pool.query('SELECT * FROM rooms WHERE id = ?', [roomId], (error, result, fields) => {
        if (error) {
            res.send(error, 500)
        }else{
            if (result.length != 1) {
                res.send('No room found with ID ' + roomId, 404)
            }else{
                res.send(result[0])
            }
        }
    })
})

app.post('/rooms', function (req, res) {

    let id = uuid()
    let owner = null
    let name = req.body.name
    let socketUrl = req.body.socketUrl
    let signallingUrl = req.body.signallingUrl

    console.log(socketUrl)

    pool.query("INSERT INTO rooms VALUES (?, ?, ?, ?, ?)", [id, owner, name, socketUrl, signallingUrl], (error, result, fields) => {
        if (error) {
            res.send(error, 500)
        }else{
            room = {id: id, ownerId: owner, name: name, socketUrl: socketUrl, signallingUrl: signallingUrl} // Echo back the new room.
            res.send(room, 201)
        }
    })
})

app.patch('/rooms/:roomId/owner', function (req, res) {

    let roomId = req.params.roomId;
    let owner = req.body.ownerId

    pool.query('UPDATE rooms SET ownerId = ? WHERE id = ?', [owner, roomId], (error, result, fields) => {
        if (error) {
            res.send(error, 500)
        }else{
            res.sendStatus(200)
        }
    })
})

app.patch('/rooms/:roomId/name', function (req, res) {
    let roomId = req.params.roomId;
    let name = req.body.name

    pool.query('UPDATE rooms SET name = ? WHERE id = ?', [name, roomId], (error, result, fields) => {
        if (error) {
            res.send(error, 500)
        }else{
            res.sendStatus(200)
        }
    })
})

app.delete('/rooms/:roomId', function (req, res) {
    let roomId = req.params.roomId;
    pool.query('DELETE FROM rooms WHERE id = ?', [roomId], (error, result, fields) => {
        if (error) {
            res.send(error, 500)
        }else{
            res.sendStatus(200)
        }
    })
})

app.listen(port, () => {
    console.log('User repository is listening at port: ' + port)
    initalizeDatabase()
})