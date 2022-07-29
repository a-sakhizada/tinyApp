const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const cookieParser = require("cookie-parser");

//set ejs as the view engine
app.set("view engine", "ejs");

//express middleware that translates/parses incoming (req.body) of a POST/PUT request
app.use(express.urlencoded({ extended: true }));

//express middleware reads values from the cookie.
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "https://www.google.com",
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
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  res.render("urls_index", templateVars);
});

//render the urls_new.ejs template to present the form to the user
app.get("/urls/new", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

//receiving a new longURL and adding it to the urlDatabase
app.post("/urls", (req, res) => {
  //console.log(req.body); //log the POST request body to the console

  //generate a random shortURL id
  const shortURL = generateRandomString();

  //add it to our urlDatabase
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
  //res.send("ok"); //respond with ok for now (temporary)
});

//display a single URL and its shortened form
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const templateVars = {
    id: shortURL,
    longURL: urlDatabase[shortURL],
    user: req.cookies["user_id"],
  };
  res.render("urls_show", templateVars);
});

//redirects to its associated longURL directly
app.get("/u/:id", (req, res) => {
  const shortURL = urlDatabase[req.params.id];
  const longURL = shortURL;
  res.redirect(longURL);
});

//using a POST to delete a URL resource from the urlDB
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//update your longURL in the urlDB then redirect to /urls
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const newLongURL = req.body.newURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
});

//login page
app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] };

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
  const emailExists = getUserByEmail(email);

  //if user with that email exists
  if (emailExists) {
    const existingPassword = emailExists.password;

    //compare passwords given in the form with existing users pass
    if (existingPassword === password) {
      const existingUserID = emailExists.id;
      res.cookie("user_id", users[existingUserID]);
      res.redirect("/urls");
    } else {
      res.status(403).send("Forbidden: Incorrect password! Try Again.");
    }
  } else {
    res.status(403).send("Forbidden: User with that email does NOT exist!");
  }
});

//clear user_id cookie and redirect to /urls
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//registration page
app.get("/register", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] };

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
    const password = req.body.password;

    //if the email already exists, respond with 400
    const emailExists = getUserByEmail(email);
    if (emailExists) {
      res.status(400).send("Bad Request: user account already exists!");
    } else {
      const newUserId = generateRandomString();
      users[newUserId] = { id: newUserId, email, password };
      res.cookie("user_id", users[newUserId]);
      res.redirect("/urls");
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
