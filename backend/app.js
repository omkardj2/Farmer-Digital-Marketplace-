require('dotenv').config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const path = require("path");
const http = require('http');
const { setupWebSocketServer } = require('./websocket/deliveryTracking');
const connectDB = require('./config/mongoose-connection');
const app = express();

const auth = require("./routes/auth");
const usersRouter = require("./routes/usersRouter");
const farmerRouter = require("./routes/farmerRouter");
const adminRouter = require('./routes/adminRouter');
const deliveryRouter = require('./routes/delivery');
const api = require('./routes/api');

// Initialize MongoDB connection
connectDB();

app.use(cors({
    origin: ['http://127.0.0.1:8080', 'http://127.0.0.1:51976', 'http://localhost:8080', 'http://localhost:51976'],
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
app.use('/api', api);
app.use('/admin', adminRouter);
app.use('/delivery', deliveryRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Server configuration
const PORT = process.env.PORT || 3000;
const HOST = '127.0.0.1';

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
setupWebSocketServer(server);

// Start server
server.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});