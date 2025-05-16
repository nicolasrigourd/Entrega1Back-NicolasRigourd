// routes/carts.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// POST /api/carts/ — Crear un nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await Cart.create({ products: [] });
    return res.status(201).json(newCart);
  } catch (err) {
    console.error('Error en POST /api/carts →', err);
    return res.status(500).json({ error: 'Error al crear el carrito' });
  }
});

// GET /api/carts/:cid — Listar productos de un carrito (con populate)
router.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await Cart.findById(cid).populate('products.product');
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    return res.json(cart);
  } catch (err) {
    console.error(`Error en GET /api/carts/${cid} →`, err);
    return res.status(500).json({ error: 'Error al obtener el carrito' });
  }
});

// POST /api/carts/:cid/product/:pid — Agregar o incrementar producto en carrito
router.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const existing = cart.products.find(p => p.product.toString() === pid);
    if (existing) {
      existing.quantity += 1;
    } else {
      const product = await Product.findById(pid);
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();
    const updated = await cart.populate('products.product');
    return res.json(updated);
  } catch (err) {
    console.error(`Error en POST /api/carts/${cid}/product/${pid} →`, err);
    return res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});

// DELETE /api/carts/:cid/products/:pid — Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();

    const updated = await cart.populate('products.product');
    return res.json(updated);
  } catch (err) {
    console.error(`Error en DELETE /api/carts/${cid}/products/${pid} →`, err);
    return res.status(500).json({ error: 'Error al eliminar el producto del carrito' });
  }
});

// PUT /api/carts/:cid — Reemplazar todo el array de productos del carrito
router.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body; // Array de { product: pid, quantity: n }
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    if (!Array.isArray(products)) return res.status(400).json({ error: 'Formato de products inválido' });

    cart.products = products.map(p => ({
      product: p.product,
      quantity: p.quantity
    }));
    await cart.save();

    const updated = await cart.populate('products.product');
    return res.json(updated);
  } catch (err) {
    console.error(`Error en PUT /api/carts/${cid} →`, err);
    return res.status(500).json({ error: 'Error al actualizar el carrito' });
  }
});

// PUT /api/carts/:cid/products/:pid — Actualizar solo la cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  try {
    if (quantity == null) return res.status(400).json({ error: 'Quantity es requerido' });

    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    const prodInCart = cart.products.find(p => p.product.toString() === pid);
    if (!prodInCart) return res.status(404).json({ error: 'Producto no encontrado en el carrito' });

    prodInCart.quantity = quantity;
    await cart.save();

    const updated = await cart.populate('products.product');
    return res.json(updated);
  } catch (err) {
    console.error(`Error en PUT /api/carts/${cid}/products/${pid} →`, err);
    return res.status(500).json({ error: 'Error al actualizar la cantidad del producto' });
  }
});

// DELETE /api/carts/:cid — Eliminar todos los productos del carrito
router.delete('/:cid', async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    cart.products = [];
    await cart.save();

    return res.json({ message: 'Carrito vaciado' });
  } catch (err) {
    console.error(`Error en DELETE /api/carts/${cid} →`, err);
    return res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
});

module.exports = router;
