const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require('cookie-parser')

const auth = require("./routes/auth")
const usersRouter = require("./routes/usersRouter");
const farmerRouter = require("./routes/farmerRouter");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors());
app.use("/auth" , auth)
app.use("/users" , usersRouter);
app.use("/farmer" , farmerRouter);

app.listen(3000);