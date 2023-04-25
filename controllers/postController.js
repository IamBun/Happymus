const db = require("../util/database");

//TAO THEM QUERY DE LUU ANH NEU POST CO ANH
exports.getPosts = async (req, res, next) => {
  const userId = req.user.id;
  const page = req.query.page ? req.query.page : 0;
  //   console.log(userId);
  try {
    if (!userId) {
      res.status(404).json("No users found");
      throw new Error("No user found !");
    }

    const posts = await db.query(
      "SELECT * FROM posts WHERE user_Id = " +
        userId +
        " ORDER BY posts.id DESC LIMIT 20 OFFSET " +
        page * 5
    );

    if (!posts) {
      console.log("No posts found");
      res.json({ message: "No posts found" });
    }
    const result = posts[0];
    for (let i = 0; i < result.length; i++) {
      //Neu co Image
      if (result[i].image_id) {
        //Lay ra mang ID
        const imageIds = result[i].image_id.split(",");
        //   console.log(imageIds);
        // Tao mang de luu path
        const imageArray = [];
        //query ID de lay ra path
        for (let image of imageIds) {
          const imagePath = await db.query(
            "SELECT file_path from user_uploads WHERE id =" + image
          );
          //  console.log("imagePath", imagePath[0][0].file_path);
          //them path vao
          imageArray.push(imagePath[0][0].file_path);
        }
        //them path vao mang ket qua
        result[i]["imageArray"] = imageArray;
      }
    }
    //  console.log(result);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

exports.createPost = async (req, res, next) => {
  const userId = req.user.id;
  const content = req.body.content;
  const files = req.files;
  const privacy = req.body.privacy || 0;
  const imageIds = [];
  try {
    if (!userId) {
      res.status(404).json("No users found");
      throw new Error("No user found !");
    }
    //luu content vao db
    const response = await db.query(
      "INSERT INTO posts (user_id, content, privacy) Values (?,?,?)",
      [userId, content, privacy]
    );
    //lay ra post ID
    const postId = response[0].insertId;
    //  console.log(postId);
    //neu co anh thi luu anh vao db
    if (files) {
      for (let i = 0; i < files.length; i++) {
        //   console.log(files[i].path);
        const images = await db.query(
          "INSERT INTO user_uploads (file_path, uid_fk) Values (?,?)",
          [files[i].path, userId]
        );
        imageIds.push(images[0].insertId);
      }
    }
    //lay ra imageID cua anh vua luu de them vao db

    //  console.log("imageIds", imageIds);
    await db.query("UPDATE posts SET image_id = ? WHERE id = ?", [
      imageIds.join(","),
      postId,
    ]);

    res.json("ok");
  } catch (error) {
    next(error);
  }
};

exports.getMorePosts = async (userId, lastPostId) => {
  // const query = 'SELECT * FROM posts WHERE user_id = ' + userId + ""
  const posts = await db.query(
    "SELECT * FROM posts WHERE user_Id = " +
      userId +
      " AND id <" +
      lastPostId +
      " ORDER BY posts.id DESC LIMIT 20 "
  );

  if (!posts) {
    console.log("No posts found");
    return { message: "No posts found" };
  }
  const result = posts[0];
  for (let i = 0; i < result.length; i++) {
    //Neu co Image
    if (result[i].image_id) {
      //Lay ra mang ID
      const imageIds = result[i].image_id.split(",");
      //   console.log(imageIds);
      // Tao mang de luu path
      const imageArray = [];
      //query ID de lay ra path
      for (let image of imageIds) {
        const imagePath = await db.query(
          "SELECT file_path from user_uploads WHERE id =" + image
        );
        //  console.log("imagePath", imagePath[0][0].file_path);
        //them path vao
        imageArray.push(imagePath[0][0].file_path);
      }
      //them path vao mang ket qua
      result[i]["imageArray"] = imageArray;
    }
  }
  //   console.log("result", result);
  return result;
};
