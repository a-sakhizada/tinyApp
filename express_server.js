const express = require("express");
const app = express();
const PORT = 8080; //default port 8080

//set ejs as the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "https://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//sending HTML (rendered on client)
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//send urlDatabase data through templateVars to urls_index.ejs
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//display a single URL and its shortened form
app.get("/urls/:id", (req, res) => {
    const shortURL = req.params.id;
    const templateVars = { id: shortURL, longURL: urlDatabase[shortURL]};
    res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
