$(function () {
  const socket = io()

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
  }
  Chat.prototype = {
    init () {
      console.log('init')
    }
  }


  let chat = new Chat()
  chat.init()

})