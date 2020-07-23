$(function () {
  // const socket = io()
  let socket

  function Chat () {
    this.userName // 当前登录用户名;
    this.userImg; // 用户头像
    this.id; // 用户socketId
    this.userList = []; // 好友列表
    this.chatGroupList = []; // 群聊列表
    this.sendFriend = ''; // 当前聊天好友的用户socketId
    this.sendChatGroup = ''; // 当前聊天的群聊的roomId
    this.messageJson = {}; // 好友消息列表
    this.msgGroupJson = {}; // 群聊消息列表
    this.tag = 0; // 0 我的好友面板  1 群聊面板
    this.chatGroupArr = [] // 群聊人员数组
  }
  Chat.prototype = {
    init () {
      console.log('init')
      $('.chat-btn').click(() => {
        let userName = $('.user-name').val()
        let userImg = $('.my-por')[0].src
        this.login(userName, userImg)
      })
      this.setClickEvent()
    },
    setClickEvent () {
      $('.select').click(() => {
        console.log('select click')
      })
      $('.inp').keyup(ev => {
        // 回车事件
        if (ev.code === 'Enter') {
          e.preventDefault ? e.preventDefault() : e.returnValue = false
          this.sendMessage()
        }
      })
      $('.send-message').click(() => {
        this.sendMessage()
      })
      // 群聊发消息
      $('.send-message-group-chat').click(() => {
        this.sendMessageGroup()
      })
      // 群聊发消息
      $('.group-chat-inp').keyup(ev => {
        if (ev.code === 'Enter') {
          ev.preventDefault? ev.preventDefault() : ev.returnValue = false
          this.sendMessageGroup()
        }
      })
    },
    
    login (userName, userImg) {
      console.log(userName, userImg)
      this.initSocket(userName, userImg)
    },
    initSocket (userName, userImg) {
      console.log('initSocket')
      // 调用此方法时触发socket connect事件
      socket = io()

      socket.on('connect', () => {
        console.log('connect')
        // 隐藏登录 显示聊天界面
        $('#login-wrap').css('display', 'none')
        $('.chat-panel').css('display', 'block')

        this.userName = userName
        this.userImg = userImg
        this.id = socket.id
        let userInfo = {
          id: socket.id,
          userName: userName,
          userImg
        }
        socket.emit('login', userInfo)
        this.setMyInfo()
      }),
      socket.on('userList', userList => {
        console.log('chat.js userList')
        this.userList = userList
        this.drawUserList()
      })

      socket.on('quit', socketId => {
        this.userList = this.userList.filter(item => item.id !== socketId)
        this.drawUserList()
      })

      socket.on('receiveMsg', data => {
        console.log('receiveMsg')
      }),
      socket.on('receiveMsgGroup', data => {
        console.log('receiveMsgGroup', data)
        // 
        this.setMsgGroupJson(data)
        if (this.tag) {
          // 群聊面板
          // 判断收到的是不是当前群聊的，不是就标记红点，是就绘制聊天内容
          if (data.roomId === this.sendChatGroup) {
            this.drawChatGroupMsgList()
          } else {
            $('.me_' + data.roomId).html(parseInt($('.me_' + data.roomId).html()) + 1).css('display', 'block')
          }
        } else {
          // 当前在个人聊天页面，群聊提示新消息  并且群聊列表中对应群聊提示新消息
          $('.me-group-chat-tab').html(parseInt($('.me-group-chat-tab').html()) + 1).css('display', 'block')

          $('.me_' + data.roomId).html(parseInt($('.me_'+ data.roomId)) + 1).css('display', 'block')
        }
      })
      // 把新创建的组加入群聊组列表
      socket.on('addGroupToChatGroupList', chatGroup => {
        this.chatGroupList.push(chatGroup)
        this.drawChatGroupList()
      })
      socket.on('createChatGroup', data => {
        socket.emit('joinChatGroup', {
          id: this.id,
          userName: this.userName,
          info: data,
        })
      })
    },
    // 单发送消息
    sendMessage () {
      if (!this.sendFriend) {
        alert('请选择好友!')
      } else  {
        let info = {
          sendId: this.id,
          id: this.sendFriend,
          userName: this.userName,
          img: this.userImg,
          msg: $('.inputDiv').val()
        }
        socket.emit('sendMsg', info)
        // todo
        this.drawMessageList()
      }
    },
    // 群聊发送消息
    sendMessageGroup () {
      console.log(this.sendChatGroup)
      let info = {
        roomId: this.sendChatGroup, // 原型里用this调用
        sendId: this.id,
        userName: this.userName,
        img: this.userImg,
        msg: $('.group-chat-inp').html()
      }

      socket.emit('sendMsgGroup', info)

      if (this.msgGroupJson[this.sendChatGroup]) {
        this.msgGroupJson[this.sendChatGroup].push(info)
      } else {
        this.msgGroupJson[this.sendChatGroup] = [info]
      }
      this.drawChatGroupMsgList()
    },
    drawUserList () {
      let str = ''
      this.userList.forEach(item => {
        // 在列表里显示其他用户
        if (item.id !== this.id) {
            str +=`<div class="user-item friend-item" onclick="changeChat(this)">
              <span>${item.userName} ${item.id}</span>
            </div>`
        }
      })
      $('.friends-info').html(str)
    },
    changeChat () {
      console.log('changechat')
    },
    setMyInfo () {
      $('.my-info').append(`<div class="user-item" style="border-bottom: 1px solid #eee;margin-bottom: 30px;"><span>用户：${this.userName}</span></div>`)
    },
    setMessageJson (data) {
      if (this.messageJson[data.sendId]) {
        this.messageJson[data.sendId].push(data)
      } else {
        this.messageJson[data.sendId] = [data]
      }
    },
    setMsgGroupJson (data) {
      if (this.msgGroupJson[data.roomId]) {
        this.msgGroupJson[data.roomId].push(data)
      } else {
        this.msgGroupJson[data.roomId] = [data]
      }
    },
    drawMessageList () {
      let msg = ''

    },
    drawChatGroupList () {
      console.log('drawChatGroupList', this.chatGroupList.length)
      if (this.chatGroupList.length > 0) {
        $('.now-select').css('display', 'none')
        $('.create-group').css('display', 'none')
        $('.select-chat-group').css('display', 'none')
        
        let str = ''
        this.chatGroupList.forEach(item => {
          str += `
            <div class="chat-group-item" onclick="changeChatGroup(this)" style="border-bottom: 1px solid #eee;margin-bottom: 30px;">
              <span style="padding-left: 20px;">${item.chatGroupName}</span>
              <input type="hidden" value="${item.roomId}">
              <div class="circle me_${item.roomId}" style="display: none;">0</div>
              <button onclick="exitGroupRoom('${item.roomId}')">退出</button>
            </div>
          `
        })
        $('.chat-group-list').html(str)
      } else {
        $('.now-select').css('display', 'block')
        $('.create-group').css('display', 'block')
        $('.select-chat-group').css('display', 'block')
        $('.group-chat-default').css('display', 'block')
        $('.group-chat-group-box').css('display', 'block')
        $('.chat-group-list').html('')
      }
    },

    drawChatGroupMsgList () {
      console.log('drawChatGroupMsgList', this.msgGroupJson)
      if (!this.msgGroupJson[this.sendChatGroup]) {
        return
      }
      let msg = ''
      this.msgGroupJson[this.sendChatGroup].forEach(item => {
        if (item.system) {
          msg += `<span class="system">${item.msg}</span><br>`
        } else if (item.sendId === this.id) {
          msg += `
            <div class="msg-box right">
              <div class="msg">${item.msg}</div>
              <img src="${item.img}"  style="width:60px;height:60px;" />
            </div>
            `
        } else {
          msg += `
            <div class="msg-box left">
              <img src="${item.img} style="width:60px;height:60px;">
              <div class="msg">${item.msg}</div>
            </div>
          `
        }
      })
      $('.group-chat-box').html(msg)
      $('.group-chat-box').scrollTop = $('.group-chat-box').scrollHeight
      $('.group-chat-inp').html('')
      $('.group-chat-inp').focus()
    }

  } // end Chat.prototype

  // common functions
  // 外部调用函数
  window.changeTab = function (cls, listCls, showGroupPanel) {
    chatInstance.tag = showGroupPanel
    if (showGroupPanel) {
      $('.friends-info').css('display', 'none')
      $('.message-wrap').css('display', 'none')

      $('.group-chat-info').css('display', 'block')
      $('.group-chat-wrap').css('display', 'block')

      $('.me-group-chat-tab').html(0)
      $('.me-group-chat-tab').css('display', 'none')

      $('.friend-tab').css('color', '#000')
      $('.group-chat-tab').css('color', '#308e56')

    } else  {
      $('.friends-info').css('display', 'block')
      $('.message-wrap').css('display', 'block')

      $('.group-chat-info').css('display', 'none')
      $('.group-chat-wrap').css('display', 'none')

      $('.me-friend-tab').html(0)
      $('.me-friend-tab').css('display', 'none')


      $('.friends-info').css('color', '#308e56')
      $('.group-chat-tab').css('color', '#000')

    }
  }

  window.createChatGroup = function () {
    $('.create-group').css('display', 'block')
    let str = ''
    chatInstance.userList.forEach(item => {
      if (item.id !== chatInstance.id) {
        str += `
          <div class="user-item friend-item" onclick="selectChatGroup(this)">
            <img src="${item.userImg}" style="width: 60px;height: 60px;" />
            <span>${item.userName}</span>
            <input type="hidden" value="${item.id}" />
            <div class="circle me_${item.id}" style="display:none;">0</div>
          </div>
        `
      }
    })
    $('.select-chat-group').css('display', 'block')
    $('.select-chat-group').html(str)
  }

  window.selectChatGroup = function (ev) {
    if (ev.getAttribute('isSelect') === 'true') {
      return
    }
    let img = ev.children[0].getAttribute('src')
    let userName = ev.children[1].innerHTML
    let id = ev.children[2].getAttribute('value')

    $('.now-select').append(`<div>${userName}</div>`).css('display', 'block')
    if (chatInstance.chatGroupArr) {
      chatInstance.chatGroupArr.push({
        img,
        id,
        userName
      })
    } else {
      chatInstance.chatGroupArr = [{
        img,
        id,
        userName
      }]
    }
    ev.setAttribute('isSelect', true)
  }

  window.changeChatGroup = function (ev) {
    $('.group-chat-default').css('display', 'none')
    $('.group-chat-group-box').css('display', 'block')
    $('.chat-group-name').html(ev.children[0].innerHTML)
    $('.group-chat-inp').focus()

    $('.group-chat-box').html('')
    $('.group-chat.box').scrollTop(0)
    console.log(ev)
    // 赋值给 chatInstance对象的属性
    chatInstance.sendChatGroup = ev.children[1].value
    console.log(chatInstance.sendChatGroup)
    // console.log(chatInstance)
    chatInstance.drawChatGroupMsgList()

    $('.me_' + chatInstance.sendChatGroup).html(0)
    $('.me_' + chatInstance.sendChatGroup).css('display', 'none')
  }

  window.confirmChatGroup = function () {
    // console.log(chatInstance)
    chatInstance.chatGroupArr.push({
      img: chatInstance.userImg,
      id: chatInstance.id,
      userName: chatInstance.userName
    })
    // 可以访问socket
    socket.emit('createChatGroup', {
      masterId: chatInstance.id,
      masterName: chatInstance.userName,
      roomId:'room_' + chatInstance.id + (Date.now()),
      chatGroupName: $('.chat-group-name-input').val(),
      member:chatInstance.chatGroupArr
    })
    $('.now-select').html('')
    $('.chat-group-name-input').val('')
    chatInstance.chatGroupArr = []
  }
  
  // html中调用的方法将property里的函数再封装一遍供外部调用
  window.changeChat = function (ev) {
    chatInstance.changeChat(ev)
  }

  window.exitGroupRoom = function (roomId) {
    console.log('exitGroupRoom', roomId)
  }
  // common functions end

  // init object
  let chatInstance = new Chat()
  chatInstance.init()

})

// 直接调用函数写在jquery外面 或者window.funcName = function () {}, 写在jquery里面
/*
function changeTab (cls, listCls, showGroupPanel) {
  console.log('changeTab')
}
*/
