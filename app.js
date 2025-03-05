const express = require("express");
const app = express();


const auth = require("./routes/auth")
const usersRouter = require("./routes/usersRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/" , auth)
app.use("/users" , usersRouter);

app.listen(3000);