const socket = io();

//Elements
const $messageForm = document.querySelector("#message-form");
const $sendLocation = document.querySelector("#send-location");
const $messageFormInput = document.querySelector("input");
const $sendMessage = document.querySelector("#send-message");
const $messages = document.querySelector("#messages");

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML;

socket.on("message", (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm A"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = document.querySelector("input").value;
  socket.emit("sendMessage", message, () => {
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
