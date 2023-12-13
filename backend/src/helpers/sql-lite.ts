const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = process.env.NODE_ENV === 'production' ? '/usr/src/app/db/mydatabase.db' : path.join(__dirname, '/../../../db/mydatabase.db');
console.log('dbPath: ', dbPath); 
export const db = new sqlite3.Database(dbPath, (err: any) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the mydatabase.db database.');
});