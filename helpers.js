const bcrypt = require("bcryptjs");

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

function getUserByEmail(email, database) {
  let user;
  const userValues = Object.values(database);
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

module.exports = {generateRandomString, getUserByEmail, urlsForUser, urlDatabase, users};
