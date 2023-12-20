const express = require('express');
const path = require('path');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const port = 5500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Helper function to render the registration page
function renderRegistrationPage({ error, name, phone }) {
    return `
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <h1 style="color: blue; position: fixed; top: 0; left: 0;">Go</h1>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="styles.css">
            <title>User Registration</title>
        </head>

        <body>
            <div class="container">
                <h1>Register with Go</h1>
                <form id="registrationForm" action="http://localhost:5500/register" method="post" onsubmit="return validateForm()">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" value="${name || ''}" required>

                    <label for="phone">Phone:</label>
                    <input type="tel" id="phone" name="phone" value="${phone || ''}" required>

                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>

                    <button type="submit">Register</button>
                    <p id="error-message" style="color: red;">${error || ''}</p>
                </form>
                <p>Already have an account?   <a href="login.html">Log in here</a></p>
                <p> <a href="home.html">Home Page</a></p>
            </div>
            <script>
                // Your existing JavaScript code here
            </script>
        </body>

        </html>
    `;
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
                res.status(500).send(renderRegistrationPage({ error: 'Registration failed' }));
            } else if (checkResult.length > 0) {
                const errorMessage = 'Phone number already registered';
                res.status(400).send(renderRegistrationPage({ error: errorMessage, name, phone }));
            } else {
                const insertQuery = 'INSERT INTO users (name, phone, password) VALUES (?, ?, ?)';
                await db.query(insertQuery, [name, phone, hashedPassword]);
                console.log('User registered');

                res.redirect('/successfullyregistered.html?message=User%20successfully%20registered');
            }
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send(renderRegistrationPage({ error: 'Registration failed' }));
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
