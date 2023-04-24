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
  res.json("ok");
};
