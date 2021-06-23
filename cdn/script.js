var socket = io();

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var setname = document.getElementById('setname');
var input = document.getElementById('input');

input.value = "Enter in the information in the overlay form first";

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
  msg.msg = escapeHtml(msg.msg);
  msg.user = escapeHtml(msg.user);
  var item = document.createElement('li');
  item.innerHTML = `<b>${msg.user}:</b> ${msg.msg}`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
socket.on('join', function (msg) {
  msg = escapeHtml(msg);
  var item = document.createElement('li');
  item.innerHTML = `<b>[system]:</b> A user <b>${msg}</b> joined the chat room`;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});
socket.on('leave', function (msg) {
  msg = escapeHtml(msg);
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
  document.getElementById("overlay").style.display = "none";
  setname.remove();
});

function escapeHtml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}