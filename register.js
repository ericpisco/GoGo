const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const ejs = require('ejs');

const app = express();
const port = 5500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: null,
    database: 'go',
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Serve static files from the root directory
app.use(express.static(__dirname));

// Helper function to render the registration page using EJS
function renderRegistrationPage(res, { error, name, phone }) {
    res.render('register', { error, name, phone });
}

// API endpoint
app.post('/register', async (req, res) => {
    const { name, phone, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const checkQuery = 'SELECT * FROM users WHERE phone = ?';
        db.query(checkQuery, [phone], async (checkErr, checkResult) => {
            if (checkErr) {
                console.error('Error checking phone number:', checkErr);
                renderRegistrationPage(res, { error: 'Registration failed' });
            } else if (checkResult.length > 0) {
                const errorMessage = 'Phone number already registered';
                renderRegistrationPage(res, { error: errorMessage, name, phone });
            } else {
                const insertQuery = 'INSERT INTO users (name, phone, password) VALUES (?, ?, ?)';
                await db.query(insertQuery, [name, phone, hashedPassword]);
                console.log('User registered');

                res.redirect('/login.html?message=User%20successfully%20registered');
            }
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        renderRegistrationPage(res, { error: 'Registration failed' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
