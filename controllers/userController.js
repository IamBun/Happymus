const { query } = require("../util/database");
const db = require("../util/database");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await db.query(
      "SELECT email, first_name, last_name FROM users"
    );
    //not found users
    if (!users) {
      res.status(404).json("No users found");
      throw new Error("No user found !");
    }

    res.json(users[0]);
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
  //   console.log("users", users);
};

//Tim Friend de ket ban
exports.findFriends = async (req, res, next) => {
  const query = req.query.name.toLowerCase().trim();
  const user = req.user;
  try {
    const users = await db.query(
      ` SELECT id, email, first_name, last_name FROM users WHERE users.id <> ${user.id} AND users.id NOT IN ( SELECT friend_one FROM friends WHERE friend_two = ${user.id} AND accepted = 0 ) AND id NOT IN ( SELECT friend_one FROM friends WHERE friend_two = ${user.id} AND accepted =1) AND id NOT IN ( SELECT friend_two FROM friends WHERE friend_one = ${user.id} AND accepted =1) AND email LIKE '%${query}%' OR first_name LIKE '%${query}%' OR last_name LIKE '%${query}%'`
    );
    if (!users) {
      const error = new Error("No user found !");
      error.statusCode = 404;
      throw error;
    }

    res.json(users[0]);

    //  SELECT id, email, first_name, last_name FROM users WHERE users.id NOT IN
    //USER REQUEST
    //  ( SELECT friend_one FROM friends WHERE friend_two = 3236 AND accepted = 0 ) AND id NOT IN
    // USER IS FRIEND
    // ( SELECT friend_one FROM friends WHERE friend_two = 3236 AND accepted =1) AND id NOT IN
    // ( SELECT friend_two FROM friends WHERE friend_one = 3236 AND accepted =1) AND
    //  email LIKE '%bun%' OR first_name LIKE '%bun%' OR last_name LIKE '%bun%'
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//send request add friend
exports.addFriend = async (req, res, next) => {
  const user = req.user;
  const friendId = req.query.friendId;

  try {
    await db.query("INSERT INTO friends(friend_one, friend_two) VALUES (?,?)", [
      user.id,
      friendId,
    ]);
    res.status(200).json("Add friend request send !");
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//accept friend when have a request
exports.acceptedFriend = async (req, res, next) => {
  const user = req.user;
  const userRequestID = req.query.userRequestID;
  const isAccept = req.query.isAccept;

  try {
    //ACCEPT request
    if (isAccept == 1) {
      await db.query(
        "UPDATE friends SET accepted = 1 WHERE friend_two = ? AND friend_one = ?",
        [user.id, userRequestID]
      );
      return res.status(200).json("Friend request Accepted !");
    }
    //DONT ACCEPT, DELETE REQUEST
    if (isAccept == 0) {
      await db.query(
        "DELETE FROM friends WHERE friend_two = ? AND friend_one = ?",
        [user.id, userRequestID]
      );
      return res.status(200).json("Friend request Cancelled !");
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//get FRIENDS list
exports.getFriends = async (req, res, next) => {
  const user = req.user;
  try {
    //get all friend from db => find userID = friend_one and accepted =1
    const friendsListInfo = [];
    //user you send request to friend
    const result = await db.query(
      "SELECT friend_two FROM friends WHERE friend_one = ? AND accepted =1",
      [user.id]
    );
    const friends = result[0];
    if (friends.length > 0) {
      //get info tu id friend lay duoc
      for (let friend of friends) {
        const result = await db.query(
          `SELECT id,email FROM users WHERE id = ${friend.friend_two}`
        );
        // console.log("info", result[0]);
        const info = result[0][0];
        friendsListInfo.push(info);
      }
    }
    //user send request for you

    const result2 = await db.query(
      "SELECT friend_one FROM friends WHERE friend_two = ? AND accepted =1",
      [user.id]
    );
    const friends2 = result2[0];
    if (friends2.length > 0) {
      //get info tu id friend lay duoc
      for (let friend of friends2) {
        const result = await db.query(
          `SELECT id,email FROM users WHERE id = ${friend.friend_one}`
        );
        const info = result[0][0];
        friendsListInfo.push(info);
      }
    }

    return res.status(200).json({ friendsListInfo, user });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//Get all friend requests
exports.getFriendRequest = async (req, res, next) => {
  const user = req.user;
  try {
    const result = await db.query(
      `SELECT friend_one FROM friends WHERE friend_two = ${user.id} AND accepted = 0`
    );

    const requests = result[0];

    if (requests.length == 0) {
      res.json({ message: "You dont have friend request" });
    }

    const requestsList = [];
    //get info tu id friend lay duoc
    for (let request of requests) {
      const result = await db.query(
        `SELECT email, id FROM users WHERE id = ${request.friend_one}`
      );
      const info = result[0][0];
      requestsList.push(info);
    }
    return res.status(200).json({ requestsList });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
