const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();
app.use(express.json());
const dbPAth = path.join(__dirname, "userData.db");

let db = null;
const initializethedbAndserver = async () => {
  try {
    db = await open({
      filename: dbPAth,
      driver: sqlite3.Database,
    });
    app.listen(3004, () => {
      console.log("Server is running at http://localhost:3004");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializethedbAndserver();

//GETTING THE ALL USER

app.get("/user/", async (request, response) => {
  const getQuery = `SELECT * FROM user;`;
  const dbResponse = await db.all(getQuery);
  response.send(dbResponse);
});
//API 1

app.post("/register", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const checkuserquery = `SELECT * FROM user WHERE username='${username}';`;
  const dbresponse = await db.get(checkuserquery);
  if (dbresponse !== undefined) {
    response.status(400);
    response.send("User already exists");
  } else {
    // response.send("user can register");
    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      //   response.send("password can be created");
      const hashedPassword = await bcrypt.hash(password, 10);
      const usercreatingquery = `INSERT INTO user(username,name,password,gender,location)
    VALUES('${username}','${name}','${hashedPassword}','${gender}','${location}');`;
      const dbResponse = await db.get(usercreatingquery);
      response.status(200);
      response.send("User created successfully");
    }
  }
});

//API 2

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selecteduserquery = `SELECT * FROM user WHERE username='${username}';`;
  const dbResponse = await db.get(selecteduserquery);
  if (dbResponse === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    // response.send("user can open its id");
    const ispasswordMatched = await bcrypt.compare(
      password,
      dbResponse.password
    );
    if (ispasswordMatched === true) {
      response.status(200);
      response.send("Login success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

//API 3

app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const gettingcurrentusernamequery = `SELECT * FROM user WHERE username='${username}';`;
  const dbresponse = await db.get(gettingcurrentusernamequery);
  //   console.log(dbresponse);
  const iscurrentpasswordMatched = await bcrypt.compare(
    oldPassword,
    dbresponse.password
  );
  //   console.log(iscurrentpasswordMatched);
  if (iscurrentpasswordMatched === false) {
    response.status(400);
    response.send("Invalid current password");
  } else {
    // response.send("current password is correct enter new password");
    if (newPassword.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      const getnewpaseword = await bcrypt.hash(newPassword, 10);
      const newpasswordupdatequery = `UPDATE user SET password='${getnewpaseword}' WHERE username='${username}';`;
      await db.run(newpasswordupdatequery);
      response.status(200);
      response.send("Password updated");
    }
  }
});

module.exports = app;
