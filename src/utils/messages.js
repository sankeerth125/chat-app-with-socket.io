const generateMessage = (message, type, username) => {
  return new Message(message, type, username);
};

class Message {
  constructor(message, type, username) {
    this.message = message;
    this.createdAt = new Date().getTime();
    this.type = type;
    this.username = username;
  }
}

const MessageType = {
  SENT: "sent",
  RECEIVED: "received",
  NOTIFICATION: "notification",
};

module.exports = {
  generateMessage,
  Message,
  MessageType,
};
