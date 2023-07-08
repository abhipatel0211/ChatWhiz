const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
dotenv.config();
const User = require("./models/Users");
const bcrypt = require("bcryptjs");
const ws = require("ws");
const Message = require("./models/Message");

const cors = require("cors");
const app = express();
app.use(cors());

console.log(process.env.CLIENT_URL);

app.use(cors());
app.use(express.json());
app.use(cookieParser());
// app.use(cors({ withcredentials: true }));
// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Credentials', 'true');
//     res.header('Access-Control-Allow-Origin', '*');
//     Add other necessary headers as needed

//     next();
//   });

app.use(
  cors({
    origin: "http://localhost:5173", // Replace with the URL of your frontend application
    credentials: true, // Set the "Access-Control-Allow-Credentials" header to "true"
  })
);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected mongoose");
  })
  .catch((err) => {
    console.log("Error Generated" + err);
  });
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

function getUserDataFromRequest(req) {
  // console.log("hello "+req.cookies.token);
  return new Promise((resolve, reject) => {
    // console.log(req.cookies);
    const token = req.cookies?.token; //here i dont get the token why
    // console.log(token);
    // console.log("hello from get user data");
    // console.log(jwtSecret);
    // console.log(Userdata);
    if (token) {
      // console.log("test")
      jwt.verify(token, jwtSecret, {}, (err, Userdata) => {
        if (err) {
          throw err;
        }
        resolve(Userdata);
      });
      // jwt.verify(token, jwtSecret, {},(err, Userdata) => {
      //     // console.log(err);
      //     // console.log("profile");
      //     // console.log(Userdata);
      //     if (err)
      //     {
      //         throw err;
      //     }
      //     // console.log("now responding");
      //     resolve(Userdata);
      // });
    } else {
      console.log("no token in getuserdata");
      reject("no token");
    }
  });
}

// app.get("/test", (req, res) => {
//   res.json("test ok");
// });

app.get("/messages/:userId", async (req, res) => {
  // console.log("hii message")
  try {
    // res.json(req.params);
    const { userId } = req.params;
    console.log("here req " + req.cookies.token);
    const userData = await getUserDataFromRequest(req);
    // console.log("userid  "+userId);
    console.log("userdata " + userData);
    const ourUserId = userData.userId;
    const messages = await Message.find({
      sender: { $in: [userId, ourUserId] },
      recipient: { $in: [userId, ourUserId] },
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.log("error in message/userid");
    console.error(error);
    // Handle the error appropriately
  }
});

app.get("/people", async (req, res) => {
  const users = await User.find({}, { _id: 1, email: 1 });
  res.json(users);
});

app.get("/profile", (req, res) => {
  console.log(req.cookies.token);
  const token = req.cookies?.token;
  console.log("inside profile");
  console.log(token);
  console.log(jwtSecret);
  // console.log(Userdata);
  if (token) {
    console.log("test");
    jwt.verify(token, jwtSecret, {}, (err, Userdata) => {
      console.log(err);
      console.log("profile");
      console.log(Userdata);
      if (err) {
        throw err;
      }
      console.log("now responding");
      res.json(Userdata);
    });
  } else {
    res.status(401).json("no token");
  }
});

app.post("/login", async (req, res) => {
  console.log("inside login");
  const { email, password } = req.body;
  try {
    const foundemail = await User.findOne({ email });
    if (foundemail) {
      console.log(email);
      const passOk = bcrypt.compareSync(password, foundemail.password);
      console.log(passOk);
      if (passOk) {
        console.log(password);
        jwt.sign(
          { userId: foundemail._id, email },
          jwtSecret,
          {},
          (err, token) => {
            //takes two things error and tocken but the token
            if (err) {
              throw err;
            }
            console.log(token);
            res
              .cookie("token", token, {
                domain: "localhost",
                path: "/",
                secure: true,
                httpOnly: true,
                expires: new Date(Date.now() + 50000),
              })
              .status(201)
              .json({
                id: foundemail._id,
                token,
                // email
              });
          }
        );
      } else {
        console.log("password wrong");
      }
    } else {
      console.log("not found");
    }
  } catch (err) {
    console.log(err);
  }
});

// const db = "mongodb://127.0.0.1:27017/mern-chat";
app.post("/register", async (req, res) => {
  // res.json("inside reg");
  console.log(req.body);
  const { email, password } = req.body;
  console.log(email);
  try {
    const hashpassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      email: email,
      password: hashpassword,
    });
    jwt.sign(
      { userId: createdUser._id, email },
      jwtSecret,
      {},
      (err, token) => {
        //takes two things error and tocken but the token
        if (err) {
          throw err;
        }
        console.log(token);
        res
          .cookie("token", token, {
            domain: "localhost",
            // path: '/',
            secure: true,
            httpOnly: true,
            expires: new Date(Date.now() + 5000),
          })
          .status(201)
          .json({
            id: createdUser._id,
            token,
            // email
          });
      }
    );
  } catch (err) {
    if (err) throw err;
    res.status(500).json("error");
  }
});

app.get("/test", (req, res) => {
  // res.send("test");
  res.json("test ok");
  res.cookie("abhi", "hello");
});

// app.post('/reg', (req,res) => {

// });

const server = app.listen(4000, () => {
  console.log("Connected successfully Port Listening localhost:4000");
});

// here ws is  a library of web server and wss is a web socket server
const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection, req) => {
  //Read email and id form the cookie  for this connection
  console.log("connected ws");
  console.log(req.headers); //now by this header we get to many information and in that info we also get the cookie which we stored so by that cookie we can get the information of the user with user name and other things as well

  function notifyAboutOnlinePeople() {
    //notify everyone about the online people (when someone connects)

    [...wss.clients].forEach((client) => {
      client.send(
        JSON.stringify({
          online: [...wss.clients].map((c) => ({
            userId: c.userId,
            email: c.email,
          })), //we are sending an object online here
        })
      );
    });
  }

  connection.isAlive = true;

  connection.timer = setInterval(() => {
    connection.ping();
    connection.deathTimer = setInterval(() => {
      connection.isAlive = false;
      // console.log("dead");
      connection.terminate();
      notifyAboutOnlinePeople();
    }, 1000);
  }, 10000); //here it will check after every 10 seconds that is the connection is online with the ping method

  connection.on("pong", () => {
    // console.log("pong");
    clearTimeout(connection.deathTimer);
  });
  // connection.send('hello ap'); //it will send the message to the client

  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => (str.startsWith = "token=")); //from this we get the token it can also handle more than one token so we get the token here
    // console.log(tokenCookieString); //token display with token=
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        console.log(token); // only token
        jwt.verify(token, jwtSecret, {}, (err, Userdata) => {
          if (err) {
            throw err;
          }
          console.log(Userdata); //we will get the user information from the cookies
          const { userId, email } = Userdata;
          connection.userId = userId;
          connection.email = email;
        });
      }
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    // console.log(messageData);
    const { recipient, text } = messageData;
    if (recipient && text) {
      //now first save the message
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
      });

      //we can use find method here but it will just point to the very first user only but if the user is connected with more than one devices than filter will find all of them thus we use filter here
      // console.log("hello");
      [...wss.clients]
        .filter((c) => c.userId === recipient)
        .forEach((c) =>
          c.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              _id: messageDoc._id,
            })
          )
        );
    }
  });

  //now to see that who is online and converting to array  by  [...wss.clients]
  // console.log("connection that are online");
  // console.log([...wss.clients].length); //total number of connection online
  // console.log([...wss.clients].map((c) => c.email)); //total number of connection online

  //from here we notify the people about online by calling a function
  notifyAboutOnlinePeople();
});

wss.on("close", (data) => {
  console.log("disconnected", data);
});

// mongoose
//     .connect(db)
//     .then(() => {
//         console.log("mongo connection successful ");
//     })
//     .catch((e) => {
//         console.log(e);
//     })

// const newSchema = new mongoose.Schema({
//     email: {
//         type: String,
//         required: true,
//     },
//     password: {
//         type: String,
//         required: true,
//     }

// },{timestamps:true});

// const collection = mongoose.model("user-details", newSchema);

// module.exports = collection;

// const app = express();
// const cors = require("cors");
// app.use(express.json());
// app.use(cors());

// app.get("/", cors(), (req, res) => {
//     // console.log("hello");
//     res.send("Hello I am abhi");
//   });
// app.post('/reg', async(req, res) => {
//     const { email, password } = req.body;
//     const data = {
//         email: email,
//         password: password,
//     };
//     console.log(req.body);
//     try {
//         const check = await collection.findOne({ email: email });
//         if (check)
//         {
//             console.log("email Aready exist");
//             res.json("exist");
//         }
//         else
//         {
//             await collection.insertMany([data]);
//             }
//     }
//     catch (e) {
//         console.log("error occurd ", e);
//     }
//     console.log("started");
//     // res.json("started");
// });

// app.post('/home', async(req, res) => {
//     const { email, password } = req.body;
//     if (!email || !password)
//     {
//         res.json("no email or password found");
//     }
//     console.log("Hello login");
//     try {
//         const check = await collection.findOne({ email: email });
//     }
//     catch (e)
//     {

//     }
// });
