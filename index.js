const express = require("express");
// const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const db = require("./util/database");
const multer = require("multer");

require("./configs/passport");

//config multer

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

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

app.use(cors({ origin: ["http://localhost:3000", "http://localhost:3001"] }));

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array("images", 4)
);
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/public", express.static(path.join(__dirname, "public")));

// app.set("view engine", "ejs");
// app.set("views", "views");

// app.use(bodyParser.urlencoded());
// app.use(bodyParser.json());
const authRoute = require("./routes/auth");
const chatRoute = require("./routes/chat");
const socket = require("./socket.js");

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoute);

app.use("/chat", chatRoute);

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  // render the error page
  res.status(err.status || 500);
});

const server = app.listen(3000, () => {
  console.log("This app is running on port 3000");
});

const io = require("./socket.js").init(server);

// Ket noi socket
io.on("connection", (socket) => {
  // console.log("Client connect !", socket.id);

  //get 20 messages from client
  socket.on("getMessage", () => {
    db.query("Select * FROM messages ORDER BY msg_id DESC LIMIT 7")
      .then((result) => {
        return result[0];
      })

      .then((messages) => {
        //tra ve messages moi cho client
        io.emit("getMessage", messages);
      });
  });

  //Client sent message
  socket.on("message", (mess) => {
    //luu message vao db
    const message = mess.message;
    db.query("INSERT INTO messages (message, uId_fk) VALUES (?,?)", [
      mess.message,
      mess.senderId,
    ]);

    // send messages to client

    db.query("Select * FROM messages ORDER BY msg_id DESC LIMIT 7")
      .then((result) => {
        return result[0];
      })

      .then((messages) => {
        // console.log("messages", messages);
        io.emit("getMessage", messages);
      });
  });

  //client send image
  socket.on("image-send", (userId) => {
    //tra ve message da co image luu
    db.query("Select * FROM messages ORDER BY msg_id DESC LIMIT 7")
      .then((result) => {
        return result[0];
      })

      .then((messages) => {
        // console.log("messages", messages);
        io.emit("getMessage", messages);
      });
  });
});

io.on("disconnect", (socket) => {
  console.log("Client disconnected !", socket.id);
});
