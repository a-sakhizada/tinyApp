const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
//const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

//set ejs as the view engine
app.set("view engine", "ejs");

//express middleware that translates/parses incoming (req.body) of a POST/PUT request
app.use(bodyParser.urlencoded({ extended: true }));

//express middleware reads values from the cookie.
//app.use(cookieParser());
app.use(cookieSession({
  name: "session",
  keys: ["key1", "key2"],
}));


const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  Psm5xK: {
    longURL: "https://www.google.com",
    userID: "aJ48lW",
  },
  Trp6uO: {
    longURL: "http://www.hi.com",
    userID: "user3RandomID",
  },
  Yvp4u5: {
    longURL: "http://www.hello.com",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "a@a.com",
    password: "aa",
  },

  aJ48lW: {
    id: "aJ48lW",
    email: "b@b.com",
    password: bcrypt.hashSync("2", 10),
  },
};

function generateRandomString() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function getUserByEmail(email) {
  let user;
  const userValues = Object.values(users);
  for (let i = 0; i < userValues.length; i++) {
    if (Object.values(userValues[i]).indexOf(email) > -1) {
      user = userValues[i];
    }
  }
  return user ? user : null;
}

function urlsForUser(id) {
  //return urls where userid is the current id logged in
  let myShortURLs = [];
  let myLongURLs = [];
  const vals = Object.values(urlDatabase);

  myShortURLs = Object.keys(urlDatabase).filter(
    (key) => urlDatabase[key].userID === id
  );

  for (let i = 0; i < vals.length; i++) {
    //console.log(vals[i]);
    if (id === vals[i].userID) {
      //console.log(`longURLs for ${id}:`, vals[i].longURL);
      myLongURLs.push(vals[i].longURL);
    }
  }
  //console.log("myShortURLs: ", myShortURLs);
  //console.log("myLongURLs: ", myLongURLs);
  return { myShortURLs, myLongURLs };
}

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// //sending HTML (rendered on client)
// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

//send urlDatabase data through templateVars to urls_index.ejs
app.get("/urls", (req, res) => {
  let templateVars = {};
  const user = req.session["user_id"];
  //console.log("after urDB:", urlDatabase);
  if (!user) {
    res.redirect("/login");
  } else {
    const urls = urlsForUser(user.id);

    templateVars = {
      shortURLs: urls.myShortURLs,
      longURLs: urls.myLongURLs,
      user: user,
    };
    res.render("urls_index", templateVars);
  }
});

//render the urls_new.ejs template to present the form to the user
app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.session["user_id"] };

  //if user is not logged in, redirect to /login
  if (!templateVars.user) {
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

//receiving a new longURL and adding it to the urlDatabase
app.post("/urls", (req, res) => {
  const user = req.session["user_id"];

  //if user isn't logged in
  if (!user) {
    res.send("<html>body><b>Login to see all URLS!</b></body></html>\n");
  }

  //generate a random shortURL id
  const shortURL = generateRandomString();

  //add it to our urlDatabase
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: user.id };

  res.redirect(`/urls/${shortURL}`);
  //res.send("ok"); //respond with ok for now (temporary)
});

//display a single longURL and its shortened form
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  let templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL].longURL && urlDatabase[shortURL],
    user: req.session["user_id"],
  };

  //if user is not logged in
  if (!templateVars.user) {
    res.redirect("/login");
  }

  //if the shortURL requested does not belong to the current logged in user
  if (templateVars.user.id !== urlDatabase[shortURL].userID) {
    //if the shortURL doesnt even exist
    console.log(
      "shortURL exists: ",
      Object.keys(urlDatabase).includes(shortURL)
    );
    if (!Object.keys(urlDatabase).includes(shortURL)) {
      console.log("shortURL doesnt exist");
      res
        .status(400)
        .send(
          "<html><body>ShortURL doesnt exist and cant be deleted!!</body></html>\n"
        );
    } else {
      console.log("short doesnt belong to you");
      res
        .status(400)
        .send(
          "<html><body>That shortURL does not belong to you! Try Again!!</body></html>"
        );
    }
  }
  res.render("urls_show", templateVars);
});

//redirects to its associated longURL directly
app.get("/u/:id", (req, res) => {
  const shortURL = urlDatabase[req.params.id];

  if (shortURL) {
    const longURL = shortURL;
    res.redirect(longURL);
  } else {
    res.send("<html><body>this short URL doesn't exist</body></html>\n");
  }
});

//using a POST to delete a URL resource from the urlDB
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const user = req.session["user_id"];

  //if user is not logged in
  if (!user) {
    res.redirect("/login");
  }

  //if the shortURL requested does not belong to the current logged in user
  if (user.id !== urlDatabase[shortURL].userID) {
    //if the shortURL doesnt even exist
    console.log(
      "shortURL exists: ",
      Object.keys(urlDatabase).includes(shortURL)
    );
    if (!Object.keys(urlDatabase).includes(shortURL)) {
      console.log("shortURL doesnt exist");
      res
        .status(400)
        .send(
          "<html><body>ShortURL doesnt exist and cant be deleted!!</body></html>\n"
        );
    } else {
      console.log("short doesnt belong to you");
      res
        .status(400)
        .send(
          "<html><body>That shortURL does not belong to you! Try Again!!</body></html>"
        );
    }
  }

  console.log("good to go delete!");
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//update your longURL in the urlDB then redirect to /urls
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.newURL;
  const user = req.session["user_id"];

  //if user is not logged in
  if (!user) {
    res.redirect("/login");
  }

  //if the shortURL requested does not belong to the current logged in user
  if (user.id !== urlDatabase[shortURL].userID) {
    //if the shortURL doesnt even exist
    console.log(
      "shortURL exists: ",
      Object.keys(urlDatabase).includes(shortURL)
    );
    if (!Object.keys(urlDatabase).includes(shortURL)) {
      console.log("shortURL doesnt exist");
      res
        .status(400)
        .send(
          "<html><body>ShortURL doesnt exist and cant be edited!!</body></html>\n"
        );
    } else {
      console.log("short doesnt belong to you");
      res
        .status(400)
        .send(
          "<html><body>That shortURL does not belong to you! Try Again!!</body></html>"
        );
    }
  }

  urlDatabase[shortURL] = {
    longURL: newLongURL,
    userID: req.session["user_id"].id,
  };
  res.redirect("/urls");
});

//login page
app.get("/login", (req, res) => {
  const templateVars = { user: req.session["user_id"] };

  //if user is already logged in
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

//login with the user_id cookie
app.post("/login", (req, res) => {
  //set cookie(user_id) to the value submitted in the request body via login form
  const email = req.body.email;
  const password = req.body.password;
  //const hashedPassword = bcrypt.hashSync(password, 10);
  const emailExists = getUserByEmail(email);
  console.log("pass: ", password);

  //if user with that email exists
  if (emailExists) {
    const existingPassword = emailExists.password;
    console.log("existing pass: ", existingPassword);

    //compare passwords given in the form with existing users pass
    if (bcrypt.compareSync(password, existingPassword)) {
      const existingUserID = emailExists.id;
      req.session.user_id = users[existingUserID];
      res.redirect("/urls");
    } else {
      res.status(403).send("Forbidden: Incorrect password! Try Again.");
    }
  } else {
    res.status(403).send("Forbidden: User with that email does NOT exist!");
  }
});

//clear user_id session and redirect to /urls
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

//registration page
app.get("/register", (req, res) => {
  const templateVars = { user: req.session["user_id"] };
 
  //if user is already logged in
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

//add a new user to the users object
app.post("/register", (req, res) => {
  //if email/pass is empty, respond with 400
  if ((req.body.email === "") | (req.body.password === "")) {
    res.status(400).send("Bad Request: enter a valid email and password");
  } else {
    const email = req.body.email;

    //if the email already exists, respond with 400
    const emailExists = getUserByEmail(email);
    if (emailExists) {
      res.status(400).send("Bad Request: user account already exists!");
    } else {
      const password = req.body.password;
      console.log("registered pass: ", password);
      const hashedPassword = bcrypt.hashSync(password, 10);
      console.log("registered hashed pass: ", hashedPassword);
      const newUserId = generateRandomString();
      users[newUserId] = { id: newUserId, email, password: hashedPassword};
      req.session.user_id = users[newUserId];
      res.redirect("/urls");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
