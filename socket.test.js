const { Server } = require("mock-socket");

class ClientApp {
  constructor(url) {
    this.messages = [];
    this.connection = new WebSocket(url);

    this.connection.onmessage = (event) => {
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
    socket.on("message", (data) => {
      expect(data).toBe("test message from app");  
      socket.send("test message from mock server");
    });
  });

  const app = new ClientApp(fakeURL);
  app.sendMessage("test message from app"); // NOTE: this line creates a micro task

  // NOTE: this timeout is for creating another micro task that will happen after the above one
  setTimeout(() => {
    expect(app.messages.length).toBe(1); 
    expect(app.messages[0]).toBe("test message from mock server");
    mockServer.stop(done);
  }, 100);
});
