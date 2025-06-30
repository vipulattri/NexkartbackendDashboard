const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { upload } = require('../utils/cloudinary');

// ✅ Create product with optional image and fields
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, rating, stock } = req.body;

    const product = await Product.create({
      name: name || '',
      description: description || '',
      price: price ? Number(price) : 0,
      rating: rating ? Number(rating) : 0,
      stock: stock ? Number(stock) : 0,
      image: req.file?.path || ''
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create product without image (optional fields)
router.post('/', async (req, res) => {
  try {
    const { name, description, price, rating, stock, image } = req.body;

    const product = await Product.create({
      name: name || '',
      description: description || '',
      price: price ? Number(price) : 0,
      rating: rating ? Number(rating) : 0,
      stock: stock ? Number(stock) : 0,
      image: image || ''
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update product (partial updates allowed)
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.rating) updateData.rating = Number(updateData.rating);
    if (updateData.stock) updateData.stock = Number(updateData.stock);

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete product
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Buy product (reduce stock by quantity)
router.post('/buy/:id', async (req, res) => {
  try {
    const quantity = parseInt(req.body.quantity) || 1;
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.stock < quantity) return res.status(400).json({ error: 'Insufficient stock' });

    product.stock -= quantity;
    await product.save();

    res.json({ message: 'Purchase successful', product });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
