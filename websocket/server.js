const WebSocket = require("ws");
const port = 3001;

const wss = new WebSocket.Server({ port });

wss.on("connection", function connection(ws) {
  console.log("A new client Connected!");
  ws.send("Welcome New Client!");

  ws.on("message", function incoming(message) {
    // unpack the message as JSON if it is a JSON string
    try {
      message = JSON.parse(message);
    } catch (e) {
      console.log("invalid json received: %s", message);
    }

    // start recording
    if (message.action === "startRecording") {
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send("startRecording");
          console.log("Recording started");
        }
      });
    }

    // stop recording
    if (message.action === "stopRecording") {
      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send("stopRecording");
          console.log("Recording stopped");
        }
      });
    }
  });

  ws.on("close", () => {
    console.log("Client has disconnected");
  });
});

console.log(`WebSocket server is running on ws://localhost:${port}`);
