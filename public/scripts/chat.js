const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $sendLocation = document.querySelector("#send-location");
const $messageFormInput = document.querySelector("input");
const $sendMessage = document.querySelector("#send-message");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplateSent = document.querySelector(
  "#message-template-sent"
).innerHTML;

const messageTemplateReceive = document.querySelector(
  "#message-template-receive"
).innerHTML;

const messageTemplateNotification = document.querySelector(
  "#message-template-notification"
).innerHTML;

const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

//Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const generateTemplate = (message, messageTemplate) => {
  const html = Mustache.render(messageTemplate, {
    message: message.message,
    createdAt: moment(message.createdAt).format("h:mm A"),
    username: message.username,
  });
  $messages.insertAdjacentHTML("beforeend", html);
};

socket.on("message", (message) => {
  console.log(message.username, username, "usernames");
  if (message.type === "notification")
    generateTemplate(message, messageTemplateNotification);
  else if (
    message.username?.trim().toLowerCase() === username?.trim().toLowerCase()
  )
    generateTemplate(message, messageTemplateSent);
  else generateTemplate(message, messageTemplateReceive);
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.querySelector("input").value;
  const id = socket.id;
  socket.emit("sendMessage", { message, id }, () => {
    $messageFormInput.value = "";
    $messageFormInput.focus();
  });
});

$sendLocation?.addEventListener("click", (e) => {
  if (!navigator.geolocation) {
    return alert("Your Browser cannot support location access");
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      "sendLocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log("Location has been shared!");
      }
    );
  });
});

socket.emit("join", { username, room }, (error) => {
  console.log(error);
});
