// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;
const privateKey = process.env.PRIVATE_KEY; // کلید خصوصی از فایل .env

// Middleware
app.use(cors());
app.use(express.json());

// اتصال به پایگاه داده
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// لیست اطلاعات
let dataList = [];

// مسیر برای افزودن اطلاعات به لیست
app.post('/add-data', (req, res) => {
    const { data, key } = req.body;

    if (key !== privateKey) {
        return res.status(403).send('Invalid private key');
    }

    dataList.push(data);
    res.send('Data added to the list successfully');
});

// تابعی برای اضافه کردن اطلاعات به پایگاه داده
const addDataToDB = () => {
    if (dataList.length === 0) {
        console.log('No data available to add.');
        return;
    }

    const randomIndex = Math.floor(Math.random() * dataList.length);
    const dataToAdd = dataList[randomIndex];

    // حذف داده از لیست بعد از انتخاب
    dataList.splice(randomIndex, 1);

    // اضافه کردن داده به پایگاه داده
    const insertQuery = 'INSERT INTO daily_combo (needed_atoms, molecule_name, reward) VALUES (?, ?, ?)';
    db.query(insertQuery, [dataToAdd.needed_atoms, dataToAdd.molecule_name, dataToAdd.reward], (err) => {
        if (err) {
            console.error('Error inserting data:', err);
            return;
        }
        console.log('Data added to database:', dataToAdd);
    });
};

// مسیر API برای اجرای تابع addDataToDB
app.post('/execute-add', (req, res) => {
    const { key } = req.body;

    if (key !== privateKey) {
        return res.status(403).send('Invalid private key');
    }

    addDataToDB();
    res.send('Data added to database if available.');
});

// راه‌اندازی سرور
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
