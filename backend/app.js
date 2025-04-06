const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const path = require("path");
const app = express();

const auth = require("./routes/auth");
const usersRouter = require("./routes/usersRouter");
const farmerRouter = require("./routes/farmerRouter");
const adminRouter = require('./routes/adminRouter');
const api = require('./routes/api');

// const passport = require('passport');
// //const session = require('express-session');
// require('./config/passport-setup');

// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }));

// // Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/auth", auth);
app.use("/users", usersRouter);
app.use("/farmer", farmerRouter);
app.use('/api' , api);
app.use('/admin', adminRouter);

app.listen(3000, '127.0.0.1', () => console.log('Server running on 127.0.0.1:3000'));