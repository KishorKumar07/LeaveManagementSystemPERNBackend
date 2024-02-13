// app.js
const express = require('express');
const authRoutes = require('../backend/routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js'); 
const attendanceRoutes = require('./routes/attendanceRoutes');
const { connection } = require("./db.js");

const cors = require('cors');
const app = express();
app.use(express.json());

const PORT = 3000;
app.use(cors({ credentials: true, origin: 'http://127.0.0.1:5000' }));
connection();

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/attendance', attendanceRoutes);

app.listen(PORT, () => {
  console.log(`server is running at ${PORT}`);
});
