const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const port = 5500;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'Do we really always need a secrete key in express? I did not see this in PHP lol....',
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
                    
                    res.json(res.redirect('/index.html'),{ message: 'Login successful' });
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
// API endpoint for recording user activities
app.post('/do_activity', (req, res) => {
    const user = req.session.user;
    const activityDescription = req.body.activity_description;

    // Insert the activity into the database with the user ID
    const insertQuery = 'INSERT INTO users_activities (user_id, description) VALUES (?, ?)';
    db.query(insertQuery, [user.id, activityDescription], (insertErr) => {
        if (insertErr) {
            console.error('Error recording activity:', insertErr);
            res.status(500).json({ message: 'Error recording activity' });
        } else {
            res.json({ message: 'Activity recorded' });
        }
    });
});

// API endpoint to retrieve user-specific activities
app.get('/user_activities', (req, res) => {
    const user = req.session.user;

    // Retrieve activities for the specific user
    const selectQuery = 'SELECT * FROM users_activities WHERE user_id = ?';
    db.query(selectQuery, [user.id], (selectErr, selectResult) => {
        if (selectErr) {
            console.error('Error retrieving user activities:', selectErr);
            res.status(500).json({ message: 'Error retrieving user activities' });
        } else {
            res.json(selectResult);
        }
    });
});

app.listen(port, () => {
    console.log(`Login server is running on http://localhost:${port}`);
});