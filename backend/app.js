const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const app = express();

const auth = require("./routes/auth");
const usersRouter = require("./routes/usersRouter");
const farmerRouter = require("./routes/farmerRouter");

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", auth);
app.use("/users", usersRouter);
app.use("/farmer", farmerRouter);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});