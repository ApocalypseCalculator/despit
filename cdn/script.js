var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var setname = document.getElementById('setname');
var input = document.getElementById('input');

input.value = "Enter in the information at the top first";

setname.addEventListener('submit', function (e) {
  e.preventDefault();
  if (document.getElementById("name").value && document.getElementById("roomid").value) {
    socket.emit('setname', { room: document.getElementById("roomid").value, name: document.getElementById("name").value });
  }
});

var jwt = "";

form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('message', { token: jwt, msg: input.value });
    input.value = '';
  }
});

socket.on('message', function (msg) {
  var item = document.createElement('li');
  item.innerHTML = `<b>${msg.user}:</b> ${msg.msg}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
socket.on('join', function (msg) {
  var item = document.createElement('li');
  item.innerHTML = `<b>[system]:</b> A user <b>${msg}</b> joined the chat room`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
socket.on('leave', function (msg) {
  var item = document.createElement('li');
  item.innerHTML = `<b>[system]</b>: A user <b>${msg}</b> has left the chat`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
socket.on('error', function (msg) {
  var item = document.createElement('li');
  item.innerHTML = `<b>[system]</b>: Error! <b>${msg}</b>`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
socket.on('jwt', function (msg) {
  jwt = msg;
  input.disabled = false;
  input.value = '';
  setname.remove();
});