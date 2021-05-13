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
            res.status(500).send(error)
        }else{
            res.status(200).send(result)
        }
    })
})

app.get('/rooms/:roomId', function (req, res) {
    let roomId = req.params.roomId;
    pool.query('SELECT * FROM rooms WHERE id = ?', [roomId], (error, result, fields) => {
        if (error) {
            res.status(500).send(error)
        }else{
            if (result.length != 1) {
                res.status(404).send('No room found with ID ' + roomId)
            }else{
                res.send(result[0])
            }
        }
    })
})

app.post('/rooms', function (req, res) {
    console.log()
    let id = uuid()
    let owner = null
    let name = generateRandomName()
    let socketUrl = req.body.socketUrl
    let signallingUrl = req.body.signallingUrl

    if (name == undefined || socketUrl == undefined || signallingUrl == undefined) {
        res.status(400).send('Body must contain name, socketUrl and signallingUrl properties.')
    }else{
        pool.query("INSERT INTO rooms VALUES (?, ?, ?, ?, ?)", [id, owner, name, socketUrl, signallingUrl], (error, result, fields) => {
            if (error) {
                res.status(500).send(error)
            }else{
                room = {id: id, ownerId: owner, name: name, socketUrl: socketUrl, signallingUrl: signallingUrl} // Echo back the new room.
                res.status(201).send(room)
            }
        })
    }
})

app.patch('/rooms/:roomId/owner', function (req, res) {

    let roomId = req.params.roomId;
    let owner = req.body.ownerId

    pool.query('UPDATE rooms SET ownerId = ? WHERE id = ?', [owner, roomId], (error, result, fields) => {
        if (error) {
            res.status(500).send(error)
        }else{
            res.status(200).send()
        }
    })
})

app.patch('/rooms/:roomId/name', function (req, res) {
    let roomId = req.params.roomId;
    let name = req.body.name

    pool.query('UPDATE rooms SET name = ? WHERE id = ?', [name, roomId], (error, result, fields) => {
        if (error) {
            res.status(500).send(error)
        }else{
            res.status(200).send()
        }
    })
})

app.delete('/rooms/:roomId', function (req, res) {
    let roomId = req.params.roomId;
    pool.query('DELETE FROM rooms WHERE id = ?', [roomId], (error, result, fields) => {
        if (error) {
            res.status(500).send(error)
        }else{
            res.status(200).send()
        }
    })
})

app.listen(port, () => {
    console.log('User repository is listening at port: ' + port)
    initalizeDatabase()
})

const randAdjectives = ["defective", "nappy", "seperate", "few", "lackadaisical", "bent", "mute", "tedius", "dashing", "breif"]
const randNouns = ["way", "ink", "harbor", "experience", "yam", "mitten", "rock", "insurance", "hill", "apparel", "church", "vacation"]

function generateRandomName () {
    let adj = getRandomInt(randAdjectives.length);
    let nns = getRandomInt(randNouns.length);
    return randAdjectives[adj] + " " + randNouns[nns];
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}