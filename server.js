const express = require('express')
const app = express()
const server = require('http').Server(app)

const io = require('socket.io')(server)

app.use('/', express.static(__dirname + '/public' ))

let userList = []
let chatGroupList = []

io.on('connection', socket => {
  console.log('server connected.')

  socket.on('login', userInfo => {
    userList.push(userInfo)
    io.emit('userList', userList)
  })

  socket.on('sendMsg', data => {
    socket.to(data.id).emit('receiveMsg', data)  
  })

  socket.on('sendMsgGroup', data => {
    console.log('server sendMsgGroup.', data)
    socket.to(data.roomId).emit('receiveMsgGroup', data)
  })

  // 创建群聊
  socket.on('createChatGroup', data => {
    console.log('server createChatGroup', data)
    socket.join(data.roomId)
    chatGroupList[data.roomId] = data
    // 通知每一个组成员
    data.member.forEach(item => {
      io.to(item.id).emit('addGroupToChatGroupList', data)
      io.to(item.id).emit('createChatGroup', data)
    })
  })

  // 加入群聊
  socket.on('joinChatGroup', data => {
    socket.join(data.info.roomId)
    // 为房间中的所有的socket发送消息, 包括自己
    io.to(data.info.roomId).emit('chatGrSystemNotice', {
      roomId: data.info.roomId,
      msg: data.info.roomId,
      msg: data.userName + '加入了群聊!',
      system: true,
    })
  })

  //
  socket.on('leave', data => {
    socket.leave(data.roomId, () => {
      
    })
  })
  
  // 断开连接时
  socket.on('disconnect', () => {
    chatGroupList = []
    userList = userList.filter(item => item.id !== socket.id)
    // 通知其他人
    socket.broadcast.emit('quit', socket.id)
  })

  


})

server.listen(3000, () => {
  console.log('pls access the url: http://localhost:3000/')
  console.log('listen 3000 port.')
})