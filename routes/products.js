const express = require('express');
const router = express.Router();
const ProductManager = require('../managers/productManager');
const productManager = new ProductManager();

router.get('/', (req, res) => {
  const products = productManager.getProducts();
  res.json(products);
});

router.get('/:pid', (req, res) => {
  const product = productManager.getProductById(req.params.pid);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Producto no encontrado' });
  }
});

router.post('/', (req, res) => {
  const newProduct = productManager.addProduct(req.body);
  res.json(newProduct);
});

router.put('/:pid', (req, res) => {
  const updatedProduct = productManager.updateProduct(req.params.pid, req.body);
  res.json(updatedProduct);
});

router.delete('/:pid', (req, res) => {
  const result = productManager.deleteProduct(req.params.pid);
  res.json(result);
});

module.exports = router;
