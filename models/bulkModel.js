const db = require('../config/db');

const Bulk = {
  create: (data, callback) => {
    const sql = 'INSERT INTO bulk_sales SET ?';
    db.query(sql, data, callback);
  },
  findAll: (callback) => {
    db.query('SELECT * FROM bulk_sales', callback);
  },
  findById: (id, callback) => {
    db.query('SELECT * FROM bulk_sales WHERE id = ?', [id], callback);
  },
  update: (id, data, callback) => {
    db.query('UPDATE bulk_sales SET ? WHERE id = ?', [data, id], callback);
  },
  delete: (id, callback) => {
    db.query('DELETE FROM bulk_sales WHERE id = ?', [id], callback);
  }
};

module.exports = Bulk;
