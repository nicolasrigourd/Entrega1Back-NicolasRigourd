const express = require('express');
const router = express.Router();
const CartManager = require('../managers/cartManager');
const cartManager = new CartManager();

router.post('/', (req, res) => {
  const newCart = cartManager.createCart();
  res.json(newCart);
});

router.get('/:cid', (req, res) => {
  const cart = cartManager.getCartById(req.params.cid);
  if (cart) {
    res.json(cart.products);
  } else {
    res.status(404).json({ error: 'Carrito no encontrado' });
  }
});

router.post('/:cid/product/:pid', (req, res) => {
  const result = cartManager.addProductToCart(req.params.cid, req.params.pid);
  res.json(result);
});

module.exports = router;
