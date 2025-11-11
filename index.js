const express = require('express')
const path = require('path')
const crypto = require('crypto')

const app = express()
const port = 3000

// Middleware agar bisa melayani file statis dari folder "public"
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json()) // supaya bisa membaca body JSON dari POST

// Route utama
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

// Endpoint POST: generate API key barux
app.post('/create', (req, res) => {
  try {
    // Ambil parameter opsional dari client (misal panjang key)
    const { length = 32 } = req.body  // default 32 bytes
    
    // Generate key random secara kriptografis aman
    const keyBytes = crypto.randomBytes(length)
    let apiKey = keyBytes.toString('base64')
    
    // Ubah ke base64url agar aman di URL
    apiKey = apiKey.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

    // Untuk contoh, bungkus hasil dengan metadata
    const result = {
      success: true,
      apiKey,
      length: length,
      createdAt: new Date().toISOString()
    }

    res.status(200).json(result)
  } catch (err) {
    console.error('❌ Error saat generate key:', err)
    res.status(500).json({ success: false, error: 'Gagal membuat API key.' })
  }
})

// Jalankan server
app.listen(port, () => {
  console.log(`🚀 Server berjalan di http://localhost:${port}`)
})
