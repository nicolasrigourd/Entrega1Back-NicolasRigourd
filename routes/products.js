const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/productManager');

const productManager = new ProductManager();

router.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, price } = req.body;

    if (!title || !price) {
      return res.status(400).json({ error: 'Debe proporcionar título y precio' });
    }

    const newProduct = await productManager.addProduct(req.body);
    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

module.exports = router;