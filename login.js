const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
const port = 5500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'Do we really always need a secret key in express? I did not see this in PHP lol....',
    resave: true,
    saveUninitialized: true
}));

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

// Create user_activities table
const createActivitiesTable = `
    CREATE TABLE IF NOT EXISTS user_activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        activity_type VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`;

db.query(createActivitiesTable, (err) => {
    if (err) {
        console.error('Error creating user_activities table:', err);
    } else {
        console.log('user_activities table created successfully');
    }
});

// API endpoint for login
app.post('/login', async (req, res) => {
    const { phone, password } = req.body;

    try {
        // Fetch user from the database
        const selectQuery = 'SELECT * FROM users WHERE phone = ?';
        db.query(selectQuery, [phone], async (selectErr, selectResult) => {
            if (selectErr) {
                console.error('Error selecting user:', selectErr);
                res.status(500).json({ message: 'Login failed' });
            } else if (selectResult.length === 0) {
                res.json("User not found");
            } else {
                const user = selectResult[0];

                // Compare the provided password with the hashed password
                const passwordMatch = await bcrypt.compare(password, user.password);

                if (passwordMatch) {
                    // Store user data in session
                    req.session.user = {
                        id: user.id,
                        name: user.name,
                        phone: user.phone
                    };

                    // Log the user login activity
                    const logActivityQuery = 'INSERT INTO user_activities (user_id, activity_type) VALUES (?, ?)';
                    db.query(logActivityQuery, [user.id, 'login'], (logErr, logResult) => {
                        if (logErr) {
                            console.error('Error logging user activity:', logErr);
                            res.status(500).json({ message: 'Login failed' });
                        } else {
                            // Set a session variable to indicate successful login
                            req.session.loggedIn = true;

                            // Redirect to index.html
                            res.redirect('/index.html');
                        }
                    });
                } else {
                    res.json("Incorrect password");
                }
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Serve static files (including index.html)
app.use(express.static(path.join(__dirname, '/')));

app.listen(port, () => {
    console.log(`Login server is running on http://localhost:${port}`);
});
