const { Server } = require("mock-socket");

class ClientApp {
  constructor(url) {
    this.messages = [];
    this.connection = new WebSocket(url);

    this.connection.onmessage = (event) => {
      // Whenever the client receives a message
      console.log("RECEIVED MESSAGE FROM SOCKET");
      this.messages.push(event.data);
    };
  }

  sendMessage(message) {
    this.connection.send(message);
  }
}

test("that chat app can be mocked", (done) => {
  const fakeURL = "ws://localhost:8080";
  const mockServer = new Server(fakeURL);

  // Define server behaviour
  mockServer.on("connection", (socket) => {
    socket.on("message", (message) => {
      // Whenever the server receives a message
      console.log("RECEIVED MESSAGE FROM CLIENT");
      if (message) {
        const type = JSON.parse(message).type;
        switch (type) {
          case "getTestResourceChanges":
            socket.send(message); // We just send the same message back to the client (for now)
            break;
          default:
            socket.send(null);
        }
      }
    });
  });

  const app = new ClientApp(fakeURL);
  const getTestResourceChangesMsg = {
    type: "getTestResourceChanges",
    requestId: 3,
    resources: {},
  };
  app.sendMessage(JSON.stringify(getTestResourceChangesMsg));


  setTimeout(() => {
    const messages = app.messages.map(msg => JSON.parse(msg)); 
    console.log({messages});

    expect(messages.length).toBe(1)
    expect(messages[0].type).toBe("getTestResourceChanges");
    
    mockServer.stop(done);
  }, 100);
});
