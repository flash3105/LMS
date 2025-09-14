require('dotenv').config();
const cors = require('cors');
const path = require('path');
const express = require('express');
const connectDB = require('./config/db');
const app = express();
const aiRouter = require('./routes/ai');
app.use(cors({
    origin: [
        'http://127.0.0.1:8080',
        'http://localhost:8080',
        'https://lms-p1dw.onrender.com',
        'https://lms-staging-l68d.onrender.com',
        'https://inurture.co.za'

    ],
    credentials: true,
}));


connectDB();

app.use(express.json());


app.use(express.static('public'));

app.use((req, res, next) => {
  
  next();
});

// Serve uploaded files statically

app.use('/certificates', express.static(path.join(__dirname, 'certificates')));





app.get('/', (req, res) => {
    res.json({ message: 'LMS API is running', time: new Date() });
});

app.use('/api/ai', aiRouter);
app.use("/api/assist", require("./routes/assist"));
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
app.use("/api/submissions", require("./routes/quizSubmissions"));
app.get('/api/quizzes/test', (req, res) => res.send('QuizSubmit route works'));
app.use('/api/institutions', require('./routes/Institution'));




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
