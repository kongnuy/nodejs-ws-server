const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: ["http://localhost:8008", "https://anglaisenligne.cm"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});
const port = process.env.PORT || 8018;

const restClient = require("./client");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", async (socket) => {
  const sessionID = socket.handshake.query["sessionID"];
  if (sessionID) {
    const socketUser = await restClient.getUserBySession(sessionID);
    if (socketUser) {
      socket.data.user = socketUser;

      await restClient.updateConnection(socket.id, socketUser.userID);
      console.log(
        `New connection! from (${socketUser["username"]}) with socket id ${socket.id}\n`
      );
      socket.on("message", async (msg) => {
        let message = {};
        try {
          message = JSON.parse(msg);
        } catch (error) {
          message = msg;
        }
        const user = socket.data.user;
        const sendTo = await restClient.userData(message.sendTo);
        const send = {
          sendTo,
          by: user.userID,
          profileImage: user.profileImage,
          username: user.username,
          type: message.type,
          data: message.data,
        };
        console.log("msg ====>> ", msg);
        console.log("send ====>> ", send);
        io.to(sendTo.connectionID).emit("message", send);
      });
    }
  }
});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
