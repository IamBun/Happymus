const express = require("express");

const router = express.Router();

const passport = require("passport");
// const isAuth = require("../middleware/is-Auth");
const db = require("../util/database");

//POST IMAGES
router.post(
  "/postImages",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
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
  }
);

// router.get(
//   "/images/:imageId",
//   passport.authenticate("jwt", { session: false }),

//   (req, res) => {
//     const imageId = req.params.imageId;
//     console.log(req.params.imageId);
//     //Lay ra image moi nhat vua upload
//     db.query("select * from user_uploads WHERE id = (?) ", [imageId])
//       .then((results) => {
//         // console.log(results[0]);
//         return results[0];
//       })
//       .then((images) => {
//         res.json(images);
//       });
//   }
// );

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    //  console.log("req user", req.user);
    const email = req.user.email;
    const id = req.user.id;
    res.json({ email, id });
  }
);
module.exports = router;
