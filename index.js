require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
let tokens = require("./userTokens");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const mongoose = require("mongoose");

mongoose.connect(process.env.DB_HOST || null);

const resolvers = require("./resolvers");

const PORT = process.env.PORT || 5000;

const checkAuth = (req, res, next) => {
  if (!req.body.username || !req.body.token) {
    res.send({ error: "Błąd autoryzacji, nie podano wystarczających danych" });
    return;
  }
  let findToken = tokens.findIndex(
    (el) => el.username === req.body.username && el.token === req.body.token
  );
  if (findToken === -1) {
    res.send({ error: "Błąd autoryzacji" });
    return;
  }
  next();
};

app.get("/check-alive", (req, res) => res.send({ server: true }));

app.post("/login", async (req, res) => {
  if (!req.body.username || !req.body.password) {
    res.send({
      error: "Nie podano wystarczających danych w trakcie logowania",
    });
    return;
  }
  let checkLogin = await resolvers.user.checkLogin(req.body);
  if (checkLogin.error || checkLogin !== true) {
    res.send(checkLogin);
    return;
  }

  let newToken = uuidv4();

  let filterTokens = tokens.filter((el) => el.username !== req.body.username);
  tokens = filterTokens;
  if (checkLogin === true)
    tokens.push({
      username: req.body.username,
      token: newToken,
    });
  res.send({ token: newToken });
});

app.post("/logout", async (req, res) => {
  if (!req.body.username) {
    res.send({
      error: "Nie podano wystarczających danych w trakcie wylogowywania",
    });
    return;
  }

  let findToken = tokens.findIndex((el) => el.username === req.body.username);
  if (findToken === -1) {
    res.send({ error: "Nie znaleziono zalogowanego użytkownika" });
    return;
  }

  let filterTokens = tokens.filter((el) => el.username !== req.body.username);
  tokens = filterTokens;
  res.send({ logout: true });
});

app.patch("/users", checkAuth, async (req, res) => {
  let response = await resolvers.user.getUser(req.body);
  if (response.password) response.password = null;
  res.send(response);
});
app.post("/users", async (req, res) => {
  let response = await resolvers.user.newUser(req.body);
  if (response.password) response.password = null;
  res.send(response);
});
app.put("/users", checkAuth, async (req, res) => {
  let response = await resolvers.user.updateUser(req.body);
  if (response.password) response.password = null;
  res.send(response);
});
app.delete("/users", checkAuth, async (req, res) => {
  let response = await resolvers.user.deleteUser(req.body);
  if (response.password) response.password = null;
  res.send(response);
});

app.post("/notes", checkAuth, async (req, res) => {
  let response = await resolvers.user.createNote(req.body);
  if (response.password) response.password = null;
  res.send(response);
});
app.put("/notes", checkAuth, async (req, res) => {
  let response = await resolvers.user.editNote(req.body);
  if (response.password) response.password = null;
  res.send(response);
});
app.delete("/notes", checkAuth, async (req, res) => {
  let response = await resolvers.user.deleteNote(req.body);
  if (response.password) response.password = null;
  res.send(response);
});

app.post("/contacts", checkAuth, async (req, res) => {
  let response = await resolvers.user.createContact(req.body);
  if (response.password) response.password = null;
  res.send(response);
});
app.put("/contacts", checkAuth, async (req, res) => {
  let response = await resolvers.user.editContact(req.body);
  if (response.password) response.password = null;
  res.send(response);
});
app.delete("/contacts", checkAuth, async (req, res) => {
  let response = await resolvers.user.deleteContact(req.body);
  if (response.password) response.password = null;
  res.send(response);
});

app.post("/events", checkAuth, async (req, res) => {
  let response = await resolvers.user.createEvent(req.body);
  if (response.password) response.password = null;
  res.send(response);
});
app.put("/events", checkAuth, async (req, res) => {
  let response = await resolvers.user.editEvent(req.body);
  if (response.password) response.password = null;
  res.send(response);
});
app.delete("/events", checkAuth, async (req, res) => {
  let response = await resolvers.user.deleteEvent(req.body);
  if (response.password) response.password = null;
  res.send(response);
});

app.post("/debt", checkAuth, async (req, res) => {
  let response = await resolvers.user.createDebt(req.body);
  if (response.password) response.password = null;
  res.send(response);
});
app.put("/debt", checkAuth, async (req, res) => {
  let response = await resolvers.user.editDebt(req.body);
  if (response.password) response.password = null;
  res.send(response);
});
app.delete("/debt", checkAuth, async (req, res) => {
  let response = await resolvers.user.deleteDebt(req.body);
  if (response.password) response.password = null;
  res.send(response);
});

app.listen(PORT, () => console.log("Server is listening on port " + PORT));
