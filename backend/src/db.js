const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username CHAR(15) UNIQUE NOT NULL,
        password CHAR(15) NOT NULL,
        accountid CHAR(100) UNIQUE NOT NULL,
        isuser INTEGER NOT NULL CHECK (isuser IN (0, 1))
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS superusers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username CHAR(15) UNIQUE NOT NULL,
        password CHAR(15) NOT NULL,
        accountid CHAR(100) UNIQUE NOT NULL
    )`);
});

const insertUser = (username, password, accountid, isuser) => {
    return new Promise((resolve, reject) => {
        const sql = `INSERT INTO users (username, password, accountid, isuser) VALUES (?, ?, ?, ?)`;

        db.run(sql, [username, password, accountid, isuser], function (err) {
            if (err) {
                return reject(err);
            }
            resolve({ id: this.lastID, isuser, username, password, accountid });
        });
    });
};


const getUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;

        db.get(sql, [username, password], (err, row) => {
            if (err) {
                return reject(err);
            }
            if (!row) {
                return reject(new Error("404 not found"));
            }
            resolve(row);
        });
    });
};

const getSuperUser = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM superusers WHERE username = ? AND password = ?`;

        db.get(sql, [username, password], (err, row) => {
            if (err) {
                return reject(err);
            }
            if (!row) {
                return reject(new Error("404 not found"));
            }
            resolve(row);
        });
    });
};

const getAllInstitute = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM users WHERE isuser = 0";

        db.all(sql, [], (err, rows) => {
            if (err) {
                return reject(err);
            }
            if (!rows) {
                return reject(new Error("404 not found"));
            }
            resolve(rows);
        });
    });
};


module.exports = {
    insertUser,
    getUser,
    getSuperUser,
    getAllInstitute
};
