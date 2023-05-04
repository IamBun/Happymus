const db = require("../util/database");

exports.uploadImage = (req, res) => {
  const files = req.files;
  const userId = req.body.user;

  //duyet file luu anh vao db user_uploads
  files.forEach((ele) => {
    db.query("INSERT INTO user_uploads (file_path, uid_fk) Values (?,?)", [
      ele.path,
      userId,
    ]).then((results) => {
      //get Img id to add db messages collection

      db.query(
        "INSERT INTO messages (uploads, uId_fk, cache_url_image) VALUES (?,?,?)",
        [results[0].insertId, userId, ele.path]
      );
    });
  });
  return res.json("ok");
};

//get messages from 2 users
exports.getAllMessages = async (req, res, next) => {
  const user = req.user;
  const receiverId = req.query.receiverId;
  const senderId = req.query.senderId;
  try {
    const result = await db.query(
      "SELECT * FROM inbox WHERE ( senderid =" +
        user.id +
        " AND receiverid = " +
        receiverId +
        ")" +
        " OR ( senderid = " +
        receiverId +
        " AND receiverid = " +
        user.id +
        ")" +
        "ORDER BY id DESC LIMIT 20"
    );

    if (result[0].length == 0) {
      return res.status(200).json({ message: "No message loaded" });
    }
    return res.status(200).json(result[0]);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//new message from 2 user
exports.newMessage = async (req, res, next) => {
  const files = req.files;
  const user = req.user;
  const receiverId = req.body.receiverId;
  const message = req.body.message;
  // console.log("req.body", req.body);
  try {
    if (!receiverId || !message) {
      const err = new Error("Invalid");
      err.statusCode = 400;
      throw err;
    }
    const result = await db.query(
      "INSERT INTO inbox (senderid, receiverid, message) VALUES (?,?,?)",
      [user.id, receiverId, message]
    );
    // console.log("result", result);

    const newMessage = await db.query(
      "SELECT * FROM inbox WHERE id =" + result[0].insertId
    );
    return res
      .status(200)
      .json({ message: "Message sent successfully", result: newMessage[0] });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
