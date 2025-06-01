const Bulk = require('../models/bulkModel');

exports.create = (req, res) => {
  const { product_name, quantity, price } = req.body;
  const total = quantity * price;
  const user_id = req.user.id; // ← Ambil dari token JWT

  const newSale = { product_name, quantity, price, total, user_id };

  Bulk.create(newSale, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Bulk sale created', id: result.insertId });
  });
};

exports.getAll = (req, res) => {
  Bulk.findAll((err, sales) => {
    if (err) return res.status(500).json(err);
    res.json(sales);
  });
};

exports.getOne = (req, res) => {
  Bulk.findById(req.params.id, (err, sale) => {
    if (err || sale.length === 0)
      return res.status(404).json({ message: 'Sale not found' });
    res.json(sale[0]);
  });
};

exports.update = (req, res) => {
  const { product_name, quantity, price } = req.body;
  const total = quantity * price;
  const updatedData = { product_name, quantity, price, total };

  Bulk.update(req.params.id, updatedData, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Sale updated' });
  });
};

exports.remove = (req, res) => {
  Bulk.delete(req.params.id, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Sale deleted' });
  });
};
