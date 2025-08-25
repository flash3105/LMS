require('dotenv').config();
const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db');

const app = express();


app.use(cors({
    origin: [
        'http://127.0.0.1:8080',
        'http://localhost:8080',
        'https://lms-p1dw.onrender.com'
    ],
    credentials: true,
}));


connectDB();

app.use(express.json());


app.get('/', (req, res) => {
    res.json({ message: 'LMS API is running', time: new Date() });
});


app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/mycourses', require('./routes/MyCourses'));
app.use('/api', require('./routes/Assessment'));
app.use('/api', require('./routes/Resource'));
app.use('/api', require('./routes/Submit'));
app.use('/api', require('./routes/Quiz'));
app.use('/api/quizzes', require('./routes/QuizSubmit'));
app.use('/api/grades', require('./routes/Grades'));
app.use('/api', require('./routes/Analytics'));
app.use('/api', require('./routes/Todos'));
app.use('/api/Profile', require('./routes/Profile'));
app.use('/api', require('./routes/User'));
app.use('/api', require('./routes/Statistics'));
app.use('/api/messages', require('./routes/Message'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
