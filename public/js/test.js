const chatform = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

//get username and room from url
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

//join chatroom
socket.emit("joinRoom", { username, room });

// get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// message from server
socket.on("message", (message) => {
  console.log(message);
  outputMessage(message);

  //scroll
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submit
chatform.addEventListener("submit", (e) => {
  e.preventDefault();
  //get message text
  const msg = e.target.elements.msg.value;

  //emit message
  socket.emit("chatMessage", msg);

  // clear message field
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// output message to dom
function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username}<span> ${message.time}</span></p>
  <p class="text">
    ${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// add romm name to dom

const outputRoomName = (room) => {
  roomName.innerText = room;
};

// add users to dom
const outputUsers = (users) => {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
  `;
};

//Prompt the user before leave chat room
document.getElementById("leave-btn").addEventListener("click", () => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    window.location = "../index.html";
  } else {
  }
});
