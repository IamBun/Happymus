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
const {
  getMoreUserPosts,
  getMorePosts,
  getMoreNewsFeed,
} = require("./controllers/postController");
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
// const socket = require("./socket.js");
const authRoute = require("./routes/auth");
const chatRoute = require("./routes/chat");
const userRoute = require("./routes/user");
const postRoute = require("./routes/post");
const socket = require("./socket.js");

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoute);

app.use("/chat", chatRoute);

app.use("/user", userRoute);

app.use("/post", postRoute);

// catch errors
app.use(function (error, req, res, next) {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

const server = app.listen(3000, () => {
  console.log("This app is running on port 3000");
});

const io = require("./socket.js").init(server);

// Ket noi socket
io.on("connection", (socket) => {
  //setup when login
  socket.on("setup", (userId) => {
    socket.join(userId);
    console.log(userId);
  });

  //get 20 messages from client when start
  socket.on("getMessage", () => {
    db.query("Select * FROM messages ORDER BY msg_id DESC LIMIT 20")
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
    // const message = mess.message;
    db.query("INSERT INTO messages (message, uId_fk) VALUES (?,?)", [
      mess.message,
      mess.senderId,
    ]);

    // send messages to client

    db.query("Select * FROM messages ORDER BY msg_id DESC LIMIT 20")
      .then((result) => {
        return result[0];
      })

      .then((messages) => {
        // console.log("messages", messages);
        io.emit("getMessage", messages);
      });
  });

  //loadmore messages
  socket.on("loadmore", (currentMessagesLoad) => {
    db.query(
      "Select * FROM messages ORDER BY msg_id DESC LIMIT 20 OFFSET " +
        currentMessagesLoad * 20
    )
      .then((result) => {
        return result[0];
      })
      .then((messages) => {
        // console.log("messages", messages);
        io.emit("loadmore", messages);
      });
  });

  //client send image
  socket.on("image-send", (userId) => {
    //tra ve message da co image luu
    db.query("Select * FROM messages ORDER BY msg_id DESC LIMIT 20")
      .then((result) => {
        return result[0];
      })

      .then((messages) => {
        // console.log("messages", messages);
        io.emit("getMessage", messages);
      });
  });

  //ADD FRIEND REQUEST
  socket.on("addfriend", (friendId) => io.to(friendId).emit("friendrequest"));
  socket.on("acceptFriendRequest", (id) =>
    io.to(id.userRequestID).to(id.you).emit("acceptFriendRequest")
  );

  socket.on("createPost", (userId) => {
    io.to(userId).emit("createPost");
  });

  socket.on("loadMorePost", async (data) => {
    // console.log("last Mess ID", data.lastMessageId);
    const posts = await getMorePosts(data.userId, data.lastPostId);
    io.to(data.userId).emit("loadMorePost", posts);
  });

  //LOAD MORE POST FROM USER
  socket.on("getMoreUserPosts", async (data) => {
    const posts = await getMoreUserPosts(
      data.userId,
      data.ownerPostId,
      data.lastPostId
    );

    io.to(data.userId).emit("getMoreUserPosts", posts);
  });

  socket.on("loadMoreNewsFeed", async (data) => {
    const posts = await getMoreNewsFeed(data.userId, data.lastPostId);
    io.to(data.userId).emit("loadMoreNewsFeed", posts);
  });

  // user send message
  socket.on("newusermessage", (data) => {
    // console.log(data);
    io.to(data.message[0].receiverid).emit("newusermessage", data);
  });

  // WHEN USER SEND NEW MESSAGE, RENDER CHATBOX IN SENDER
  // socket.on("sendNewMessage", async (data) => {
  //   console.log("data", data);
  //   io.to(data.message[0].senderid).emit(
  //     "sendNewMessage",
  //     await data.message[0]
  //   );
  // });
});

io.on("disconnect", (socket) => {
  console.log("Client disconnected !", socket.id);
});
