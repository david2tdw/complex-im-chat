const express = require('express')
const app = express()
const server = require('http').Server(app)

const io = require('socket.io')(server)

// 路由为/ , 默认静态文件夹
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
    io.to(data.info.roomId).emit('chatGroupSystemNotice', {
      roomId: data.info.roomId,
      msg: data.info.roomId,
      msg: data.userName + '加入了群聊!',
      system: true,
    })
  })

  //
  socket.on('exitGroupRoom', data => {
    socket.leave(data.roomId, () => {
      let member = chatGroupList[data.roomId].member
      let i = -1
      member.forEach((item, index) => { // 通知群组里的其他人员
        if (item.id === socket.id) {
          i = index
        }
        io.to(item.id).emit('leaveChatGroup', {
          id: socket.id, // 退出群聊人的id
          roomId: data.roomId,
          msg: data.userName + '离开了群聊!',
          system: true
        })
      })
      if (i !== -1) {
        member.splice(i) // 将群聊中的此用户删除
      }
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