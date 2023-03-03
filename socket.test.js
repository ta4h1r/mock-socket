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
      
      // Check if the message structure is ok
      message = JSON.parse(message);
      expect(message).toBeTruthy();
      
      expect(message.resources).toBeDefined(); 
      expect(typeof message.resources).toBe("object"); 
      
      expect(message.requestId).toBeDefined();
      expect(typeof message.requestId).toBe("number");
      
      expect(message.type).toBeDefined();
      expect(message.type).toBe("getTestResourceChanges");
      
      // Socket sends a series of messages
      message["type"] = "testResourceUpdate";
      message["uri"] = "speech/en-US/hello.mp3";
      message["version"] = "abc123";
      socket.send(JSON.stringify(message));

      message["type"] = "testResourceDelete";
      delete message.version;
      socket.send(JSON.stringify(message));

      message["type"] = "testResourceTotal";
      message["n"] = 207;
      socket.send(JSON.stringify(message));

      message["type"] = "testResourcesCompleted";
      delete message.n;
      socket.send(JSON.stringify(message));

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
    const messages = app.messages.map((msg) => JSON.parse(msg));
    console.log({ messages });

    expect(messages.length).toBe(4);
    messages.forEach((msg) => {
      expect(msg.type).toBeTruthy(); 
      switch (msg.type) {
        case "testResourceUpdate":
          break;
        case "testResourceDelete":
          break;
        case "testResourceTotal":
          break;
        case "testResourcesCompleted":
          break;
      }
    });

    mockServer.stop(done);
  }, 100);
});
