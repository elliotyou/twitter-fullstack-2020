const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const userName = document.querySelector('#chat-user-name').innerText
const userId = document.querySelector('#chat-user-id').innerText
const userAvatar = document.querySelector('#chat-user-avatar').innerText
const record = document.querySelector('#record')
const broadcast = document.querySelector('#broadcast')
const onlineUsers = document.querySelector('#online-user-list')

console.log('into public/javascripts/chatAll/line11...')

socket.on('connect', () => {
  // 打包一份資料
  let msgObj = {
    senderId: userId,
    senderName: userName,
    channel: 'chat message',
    behavior: 'inout',
    message: 'is entering',
    createdAt: new Date()
  }

  //廣播這個資料給 server 讓它知道我來了
  socket.emit('chat message', msgObj);

  //接收 server 傳來的歷史記錄
  socket.on(`history-${userId}`, chats => {
    record.innerHTML = ''
    chats.forEach(chat => {
      if (chat.User.id.toString() === userId) {
        record.innerHTML += `
        <div id="my-message">
          <div>
            <p>${chat.message}</p>
            <img src="${chat.User.avatar}" style="width: 40px;height:40px;" class="rounded-circle m-1">
          </div>
          <p>${chat.createdAt}</p>
        </div>
      `
      } else {
        record.innerHTML += `
        <div id="others-message">
          <div>
            <img src="${chat.User.avatar}" style="width: 40px;height:40px;" class="rounded-circle m-1">
            <p>${chat.message}</p>
          </div>
          <p>${chat.createdAt}</p>
        </div>
      `
      }
    })
    window.scrollTo(0, document.body.scrollHeight)
  })

  //接收 server 傳來的 online users
  socket.on('online-users', users => {
    onlineUsers.innerHTML = `<p class="fw-bolder border-bottom p-1 m-0">上線使用者 (${users.length})</p>`
    users.forEach(user => {
      onlineUsers.innerHTML += `
      <div class="d-flex align-items-center border-bottom p-2" id="online-user">
        <img src="${user.avatar}" style="width: 50px;height:50px;" class="rounded-circle m-1">
        <p class="m-0">${user.name}</p>
        <p class="m-0 user-link">&nbsp;@${user.account}</p>
      </div>
    `
    })
  })
  //接收聊天室的訊息
  socket.on('chat message', msgObj => {

    //當有人上線離線的時候
    if (msgObj.behavior === 'inout') {
      broadcast.innerHTML += `
        <div id="access-record">
          <p>${msgObj.senderName} ${msgObj.message}</p>
        </div>
      `
      window.scrollTo(0, document.body.scrollHeight)
      // console.log(`${msgObj.senderName} ${msgObj.message}`)
    }

    //當有人在講話的時候
    if (msgObj.behavior === 'live-talk') {
      if (msgObj.senderId.toString() === userId) {
        broadcast.innerHTML += `
        <div id="my-message">
          <div>
            <p>${msgObj.message}</p>
            <img src="${msgObj.senderAvatar}" style="width: 40px;height:40px;" class="rounded-circle m-1">
          </div>
          <p>${msgObj.createdAt}</p>
        </div>
      `
      } else {
        broadcast.innerHTML += `
        <div id="others-message">
          <div>
            <img src="${msgObj.senderAvatar}" style="width: 40px;height:40px;" class="rounded-circle m-1">
            <p>${msgObj.message}</p>
            </div>
          <p>${msgObj.createdAt}</p>
        </div>
      `

      }
      window.scrollTo(0, document.body.scrollHeight)
    }
  });

  form.addEventListener('submit', function (e) {
    console.log('-- enable addEventListener...')
    e.preventDefault();
    if (input.value) {
      msgObj = {
        senderId: userId,
        senderName: userName,
        senderAvatar: userAvatar,
        channel: 'chat message',
        behavior: 'live-talk',
        message: input.value,
        createdAt: new Date()
      }
      socket.emit('chat message', msgObj)
      input.value = ''
      // console.log('-- sent message obj =', msgObj)
    }
  });
})




