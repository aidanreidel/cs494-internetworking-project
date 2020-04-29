// This automatically sets up the socket connection between the client and server
const socket = io()

socket.on('connect', () => {
  // Once the connection is setup, prompt the user for their name
  socket.emit('adduser', prompt("What's your name?"))

  socket.on('chat message', (username, msg) => {
    console.log(username + ': ' + msg)
    // Append a li to the message list
    appendLi('messages', username + ': ' + msg)
  })

  document.getElementById('send').addEventListener('click', e => {
    e.preventDefault()
    // M is the message box text entry field
    const m = document.getElementById('m')
    socket.emit('chat message', m.value)
    m.value = ''
  })

  document.getElementById('send-all').addEventListener('click', e => {
    e.preventDefault()
    const m = document.getElementById('m')
    // This sends a brodcast
    socket.emit('chat message-all', m.value)
    m.value = ''
  })

  document.getElementById('create-room').addEventListener('submit', e => {
    e.preventDefault()
    const roomname = document.getElementById('newRoomName')
    socket.emit('addroom', roomname.value)
    roomname.value = ''
  })

  // get the list of un joined rooms and list them out for the user to join
  document.getElementById('join-room-btn').addEventListener('click', e => {
    e.preventDefault()
    socket.emit('get other rooms', otherRooms => {
      removeChildren('join-roomList')
      if (otherRooms.length === 0) {
        appendLi('join-roomList', 'No rooms to join!')
      } else {
        otherRooms.forEach(element => {
          appendLi('join-roomList', makeHrefFn('joinRoom', element))
        })
      }
    })
  })

  document.getElementById('leave-room-btn').addEventListener('click', e => {
    e.preventDefault()
    socket.emit('get rooms', joinedRooms => {
      removeChildren('leave-roomList')
      joinedRooms.forEach(element => {
        if (!(element === 'Home'))
          appendLi('leave-roomList', makeHrefFn('leaveRoom', element))
      })
    })
  })

  //append a li for each room on the server
  socket.on('update rooms', (history, roomList, room) => {
    // First load this room's message history
    removeChildren('messages')
    history.forEach(msg => {
      appendLi('messages', msg)
    })
    // Then update the room list
    removeChildren('room-list')
    roomList.forEach(element => {
      if (element === room) appendLi('room-list', element)
      else {
        appendLi('room-list', makeHrefFn('changeRoom', element))
      }
    })
  })

  //append a li for each user in on the server
  socket.on('update users', data => {
    removeChildren('userList')
    Object.values(data).forEach(element => {
      appendLi('userList', element)
    })
  })

  socket.on('disconnect', function () {
    alert('The server has been disconnected')
  })

  socket.on('connect_failed', function () {
    alert("Uh oh! Looks like there's a problem with the connection")
  })
})

// Helper Functions

const changeRoom = room => socket.emit('change room', room)

const joinRoom = room => socket.emit('join room', room, () => closeJoinForm())

const leaveRoom = room =>
  socket.emit('leave room', room, () => closeLeaveForm())

// Appends an li to a given list element
const appendLi = (list, innerHTML) => {
  const l = document.getElementById(list)
  const li = document.createElement('li')
  // li.setAttribute('class', 'item')
  l.appendChild(li)
  li.innerHTML = innerHTML
}

// Extension for appendLi
const makeHrefFn = (fn, element) => {
  return (
    '<a href="#" onclick="' + fn + "('" + element + '\')">' + element + '</a>'
  )
}
//removes all appended children to a given element
const removeChildren = element => {
  myNode = document.getElementById(element)
  while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild)
  }
}

function openJoinForm() {
  document.getElementById('join-room').style.display = 'block'
  document.getElementById('join-room-btn').style.display = 'none'
  closeLeaveForm()
  closeCreateForm()
  closeRemoveForm()
}
function openLeaveForm() {
  document.getElementById('leave-room').style.display = 'block'
  document.getElementById('leave-room-btn').style.display = 'none'
  closeJoinForm()
  closeCreateForm()
  closeRemoveForm()
}
function openCreateForm() {
  document.getElementById('create-room').style.display = 'block'
  document.getElementById('create-room-btn').style.display = 'none'
  closeLeaveForm()
  closeJoinForm()
  closeRemoveForm()
}
function closeJoinForm() {
  document.getElementById('join-room-btn').style.display = 'block'
  document.getElementById('join-room').style.display = 'none'
}
function closeLeaveForm() {
  document.getElementById('leave-room-btn').style.display = 'block'
  document.getElementById('leave-room').style.display = 'none'
}
function closeCreateForm() {
  document.getElementById('create-room-btn').style.display = 'block'
  document.getElementById('create-room').style.display = 'none'
}
