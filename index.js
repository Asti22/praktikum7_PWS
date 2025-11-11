const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// === Koneksi database ===
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Asti22##', // ubah sesuai MySQL kamu
});

db.connect((err) => {
  if (err) throw err;
  console.log('✅ Terkoneksi ke MySQL.');

  // Buat database jika belum ada
  db.query(`CREATE DATABASE IF NOT EXISTS api_management`, (err) => {
    if (err) throw err;
    console.log('📦 Database api_management siap.');

    // Ganti ke database
    db.changeUser({ database: 'api_management' }, (err) => {
      if (err) throw err;

      // Buat tabel jika belum ada
      const tableQuery = `
        CREATE TABLE IF NOT EXISTS api_keys (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100),
          role VARCHAR(50),
          expiry_days INT,
          api_key VARCHAR(100) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      db.query(tableQuery, (err) => {
        if (err) throw err;
        console.log('🧱 Tabel api_keys siap digunakan.');
      });
    });
  });
});

// === Express App ===
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Halaman utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === Endpoint untuk generate dan simpan API key ===
app.post('/create', (req, res) => {
  const { name, role, expiry } = req.body;

  // Generate API key acak (32 karakter hex)
  const apiKey = crypto.randomBytes(16).toString('hex');

  const sql = `INSERT INTO api_keys (name, role, expiry_days, api_key) VALUES (?, ?, ?, ?)`;
  db.query(sql, [name || 'tanpa_nama', role || 'read', expiry || 0, apiKey], (err, result) => {
    if (err) {
      console.error('❌ Error menyimpan ke DB:', err);
      return res.status(500).json({ error: 'Gagal menyimpan API key' });
    }

    res.json({
      message: 'API key berhasil dibuat dan disimpan',
      apiKey: apiKey,
      id: result.insertId,
    });
  });
});

// === Endpoint untuk validasi API key ===
app.post('/validate', (req, res) => {
  const { apiKey } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'API key wajib dikirim di body request' });
  }

  const sql = `SELECT * FROM api_keys WHERE api_key = ?`;
  db.query(sql, [apiKey], (err, results) => {
    if (err) {
      console.error('❌ Error validasi:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan server' });
    }

    if (results.length === 0) {
      return res.status(401).json({ valid: false, message: 'API key tidak valid' });
    }

    // Kalau ada, kirim data yang valid
    res.json({
      valid: true,
      message: 'API key valid',
      data: results[0]
    });
  });
});


// Jalankan server
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`);
});
