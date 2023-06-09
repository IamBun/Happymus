const db = require("../util/database");

//owner get my post (MY POSTS)
exports.getPosts = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const posts = await db.query(
      //PIVOT LA BANG LAY RA POST CUA USER, JOIN VOI USERS DE LAY RA THONG TIN USER
      "SELECT users.email, users.last_name, users.first_name, PIVOT.* FROM (" +
        "SELECT * FROM posts WHERE user_Id = " +
        userId +
        " ORDER BY posts.id DESC LIMIT 20  ) AS PIVOT" +
        " JOIN users ON PIVOT.user_Id = users.id"
    );

    if (!posts) {
      return res.status(200).json({ message: "No posts found" });
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
    return res.status(200).json(result);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const userId = req.user.id;
  const content = req.body.content;
  const files = req.files;
  const privacy = req.body.privacy || 0;
  const imageIds = [];

  try {
    //luu content vao db
    const response = await db.query(
      "INSERT INTO posts (user_id, content, privacy) Values (?,?,?)",
      [userId, content, privacy]
    );
    //lay ra post ID
    const postId = response[0].insertId;
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

    await db.query("UPDATE posts SET image_id = ? WHERE id = ?", [
      imageIds.join(","),
      postId,
    ]);

    return res.status(200).json("Post created !");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//FUNCTIONS GET MORE POST
exports.getMorePosts = async (userId, lastPostId) => {
  try {
    const posts = await db.query(
      //PIVOT LA BANG LAY RA POST CUA USER CO ID < LASTPOSTID DE LAY THEM, JOIN VOI USERS DE LAY RA THONG TIN USER
      "SELECT users.email, users.last_name, users.first_name, PIVOT.* FROM ( SELECT * FROM posts WHERE user_Id = " +
        userId +
        " AND id <" +
        lastPostId +
        " ORDER BY posts.id DESC LIMIT 20 ) AS PIVOT" +
        " JOIN users ON PIVOT.user_Id = users.id"
    );

    if (!posts) {
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
  } catch (error) {
    console.log(error);
  }
};

//FRIEND'S POSTS
exports.getUserPost = async (req, res, next) => {
  const userId = req.user.id;
  const ownerPostId = req.params.id; //Lay ra id owner post

  try {
    //privacy = 0 : public || privacy = 2 va la ban be cua nhau
    const posts = await db.query(
      "SELECT users.email, users.last_name, users.first_name, PIVOT.* FROM (SELECT * FROM posts WHERE user_id = " +
        ownerPostId +
        " AND privacy = '0' OR ( user_id =" +
        ownerPostId +
        " AND privacy = '2' AND user_id IN (SELECT friend_one FROM friends WHERE friend_two =" +
        userId +
        " AND friend_one =" +
        ownerPostId +
        " AND accepted =1) OR user_id IN (SELECT friend_two FROM friends WHERE friend_one =" +
        userId +
        " AND friend_two = " +
        ownerPostId +
        " AND accepted =1))" +
        " ORDER BY posts.id DESC LIMIT 20 ) AS PIVOT" +
        " JOIN users ON PIVOT.user_Id = users.id"
    );

    if (!posts) {
      return res.status(200).json({ message: "No posts found" });
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
    return res.status(200).json(result);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//MORE FRIEND"S POST
exports.getMoreUserPosts = async (userId, ownerPostId, lastPostId) => {
  try {
    const posts = await db.query(
      "SELECT users.email, users.last_name, users.first_name, PIVOT.* FROM (SELECT * FROM posts WHERE user_id = " +
        ownerPostId +
        " AND id < " +
        lastPostId +
        " AND privacy = '0' OR ( user_id =" +
        ownerPostId +
        " AND id < " +
        lastPostId +
        " AND privacy = '2' AND user_id IN (SELECT friend_one FROM friends WHERE friend_two =" +
        userId +
        " AND friend_one =" +
        ownerPostId +
        " AND accepted =1) OR user_id IN (SELECT friend_two FROM friends WHERE friend_one =" +
        userId +
        " AND friend_two = " +
        ownerPostId +
        " AND accepted =1))" +
        " AND id < " +
        lastPostId +
        " ORDER BY posts.id DESC LIMIT 20 ) AS PIVOT" +
        " JOIN users ON PIVOT.user_Id = users.id"
    );

    if (!posts) {
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
    //  console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }
};

//MY WALL => hien thi my post va friend post
exports.getNewsFeed = async (req, res, next) => {
  const userId = req.user.id;
  try {
    //TIM LIST BAN BE
    const listFriendIds = [];
    //friend you send request
    const friend1 = await db.query(
      "SELECT friend_two FROM friends WHERE friend_one = ? AND accepted =1",
      [userId]
    );
    if (friend1.length > 0) {
      for (let friend of friend1[0]) {
        listFriendIds.push(friend.friend_two);
      }
    }
    //friend send request for you
    const friend2 = await db.query(
      "SELECT friend_one FROM friends WHERE friend_two = ? AND accepted =1",
      [userId]
    );
    if (friend2.length > 0) {
      for (let friend of friend2[0]) {
        listFriendIds.push(friend.friend_one);
      }
    }

    const posts = await db.query(
      //PIVOT LA BANG LAY RA POST CUA USER, JOIN VOI USERS DE LAY RA THONG TIN USER
      //BAI VIET CUA CHINH MINH
      "SELECT users.email, users.last_name, users.first_name, PIVOT.* FROM ( SELECT * FROM posts WHERE user_id = " +
        userId +
        //BAI VIET CUA BAN BE O CHE DO PUBLIC HOAC BAN BE O CHE DO BAN BE
        " OR ( user_id IN (" +
        listFriendIds.join(",") +
        ") AND privacy = 0 )  OR ( user_id IN (" +
        listFriendIds.join(",") +
        ") AND privacy = 2 )" +
        " ORDER BY posts.id DESC LIMIT 20 ) AS PIVOT" +
        " JOIN users ON PIVOT.user_Id = users.id"
    );

    if (!posts) {
      return res.status(200).json({ message: "No posts found" });
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

    return res.status(200).json(result);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//GET MORE MY WALL
exports.getMoreNewsFeed = async (userId, lastPostId) => {
  try {
    //TIM LIST BAN BE
    const listFriendIds = [];
    //friend you send request
    const friend1 = await db.query(
      "SELECT friend_two FROM friends WHERE friend_one = ? AND accepted =1",
      [userId]
    );
    if (friend1.length > 0) {
      for (let friend of friend1[0]) {
        listFriendIds.push(friend.friend_two);
      }
    }
    //friend send request for you
    const friend2 = await db.query(
      "SELECT friend_one FROM friends WHERE friend_two = ? AND accepted =1",
      [userId]
    );
    if (friend2.length > 0) {
      for (let friend of friend2[0]) {
        listFriendIds.push(friend.friend_one);
      }
    }

    const posts = await db.query(
      //PIVOT LA BANG LAY RA POST CUA USER, JOIN VOI USERS DE LAY RA THONG TIN USER
      "SELECT users.email, users.last_name, users.first_name, PIVOT.* FROM ( SELECT * FROM posts WHERE ( user_id = " +
        userId +
        //BAI VIET CUA BAN BE O CHE DO PUBLIC HOAC BAN BE O CHE DO BAN BE
        " OR ( user_id IN (" +
        listFriendIds.join(",") +
        ") AND privacy = 0 )  OR ( user_id IN (" +
        listFriendIds.join(",") +
        ") AND privacy = 2 )) AND posts.id <" +
        lastPostId +
        " ORDER BY posts.id DESC LIMIT 20 ) AS PIVOT" +
        " JOIN users ON PIVOT.user_Id = users.id"
    );

    //  console.log("posts", posts[0]);
    if (!posts) {
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

    return result;
  } catch (error) {
    console.log(error);
  }
};

//FRIENDS WALL => THAY DUOC BAI VIET CUA MINH< CUA BAN BE
