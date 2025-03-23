const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const app = express();

const auth = require("./routes/auth");
const usersRouter = require("./routes/usersRouter");
const farmerRouter = require("./routes/farmerRouter");
const api = require('./routes/api');

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", auth);
app.use("/users", usersRouter);
app.use("/farmer", farmerRouter);
app.use('/api' , api)

app.listen(3000, '127.0.0.1', () => console.log('Server running on 127.0.0.1:3000'));