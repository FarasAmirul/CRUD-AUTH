const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const secret = process.env.SECRET_KEY;

exports.register = (req, res) => {
  const { name, email, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  const newUser = { name, email, password: hashed };

  User.create(newUser, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'User registered' });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findByEmail(email, (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];
    const match = bcrypt.compareSync(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, secret, { expiresIn: '1d' });
    res.json({ token });
  });
};

const db = require('../config/db');

exports.getAll = (req, res) => {
  const sql = `
    SELECT u.id AS user_id, u.name, u.email,
           b.id AS bulk_id, b.product_name, b.quantity, b.price, b.total
    FROM users u
    LEFT JOIN bulk_sales b ON u.id = b.user_id
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);

    const usersMap = {};

    results.forEach(row => {
      if (!usersMap[row.user_id]) {
        usersMap[row.user_id] = {
          id: row.user_id,
          name: row.name,
          email: row.email,
          bulk: []
        };
      }

      if (row.bulk_id) {
        usersMap[row.user_id].bulk.push({
          id: row.bulk_id,
          product_name: row.product_name,
          quantity: row.quantity,
          price: row.price,
          total: row.total
        });
      }
    });

    const users = Object.values(usersMap);
    res.json(users);
  });
};


exports.getOne = (req, res) => {
  const id = req.params.id;

  User.findByIdWithBulk(id, (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const user = {
      id: results[0].user_id,
      name: results[0].name,
      email: results[0].email,
      bulks: results
        .filter(row => row.bulk_id !== null)
        .map(row => ({
          id: row.bulk_id,
          product_name: row.product_name,
          quantity: row.quantity,
          price: row.price,
          total: row.total
        }))
    };

    res.json(user);
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;
  const photo = req.file ? req.file.filename : null;

  User.findById(id, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });

    const oldPhoto = results[0].photo;
    const updateData = { name, email };
    if (photo) {
      updateData.photo = photo;

      // Hapus foto lama jika ada
      const fs = require('fs');
      const path = require('path');
      if (oldPhoto) {
        const filePath = path.join(__dirname, '..', 'public', 'uploads', oldPhoto);
        fs.unlink(filePath, (err) => {
          if (err) console.warn('Gagal hapus foto lama:', err.message);
        });
      }
    }

    User.update(id, updateData, (err, result) => {
      if (err) return res.status(500).json({ error: err });

      const photoUrl = photo
        ? `http://localhost:3000/uploads/${photo}`
        : oldPhoto
        ? `http://localhost:3000/uploads/${oldPhoto}`
        : null;

      res.json({
        message: 'User updated successfully',
        user: {
          id,
          name,
          email,
          photo: photoUrl
        }
      });
    });
  });
};

exports.remove = (req, res) => {
  User.delete(req.params.id, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'User deleted' });
  });
};