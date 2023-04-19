const express = require("express");
// const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const db = require("./util/database");
const { writeFile } = require("fs");

require("./configs/passport");

const app = express();

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.urlencoded());
app.use(express.json());

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

// app.use(bodyParser.urlencoded());
// app.use(bodyParser.json());
const authRoute = require("./routes/auth");
const chatRoute = require("./routes/chat");

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoute);

app.use("/chat", chatRoute);

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const server = app.listen(3000, () => {
  console.log("This app is running on port 3000");
});

const io = require("./socket.js").init(server);

//Ket noi socket
io.on("connection", (socket) => {
  console.log("Client connect !", socket.id);

  //get 20 messages from client
  socket.on("getMessage", () => {
    db.query("Select * FROM messages ORDER BY created DESC LIMIT 20")
      .then((result) => {
        return result[0];
      })

      .then((messages) => {
        console.log("messages", messages);
        io.emit("getMessage", messages);
      });
  });

  //Client sent message
  socket.on("message", (mess) => {
    console.log("message", mess.enteredMessInputRef);
    console.log("file", mess.enteredFile);

    writeFile("/images", mess.enteredFile);
    // send messages to client
    io.emit("message", mess.enteredMessInputRef);
  });
});
io.on("disconnect", (socket) => {
  console.log("Client disconnected !", socket.id);
});
