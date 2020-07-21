const express = require('express')
const app = express()
const server = require('http').Server(app)



app.use('/', express.static(__dirname + '/public' ))


server.listen(3000, () => {
  console.log('pls access the url: http://localhost:3000/')
  console.log('listen 3000 port.')
})