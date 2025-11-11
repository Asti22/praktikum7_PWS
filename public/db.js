const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Asti22##', // ubah kalau kamu pakai password MySQL
  database: 'api_management'
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Koneksi ke database berhasil.');
});

module.exports = db;
