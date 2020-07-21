const express = require('express')
const app = express()
const server = require('http').Server(app)

const io = require('socket.io')(server)

app.use('/', express.static(__dirname + '/public' ))


io.on('connection', socket => {
  console.log('server connected.')
})

server.listen(3000, () => {
  console.log('pls access the url: http://localhost:3000/')
  console.log('listen 3000 port.')
})