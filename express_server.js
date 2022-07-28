const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

//set ejs as the view engine
app.set("view engine", "ejs");

//express middleware that translates/parses incoming (req.body) of a POST/PUT request
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "https://www.google.com",
};

function generateRandomString() {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//render the urls_new.ejs template to present the form to the user
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  const templateVars = { id: shortURL, longURL: urlDatabase[shortURL] };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
