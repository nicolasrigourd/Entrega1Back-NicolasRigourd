const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Cart    = require('../models/Cart');

// Listado de productos con paginación
router.get('/products', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page  = parseInt(req.query.page)  || 1;
  const sort  = req.query.sort;
  const query = req.query.query;
  const cartId = req.query.cartId || '';

  // Construir filtro
  const filter = {};
  if (query) {
    if (query === 'true' || query === 'false') {
      filter.status = query === 'true';
    } else {
      filter.category = query;
    }
  }

  // Contar documentos y calcular paginación
  const totalDocs  = await Product.countDocuments(filter);
  const totalPages = Math.ceil(totalDocs / limit);
  const skip       = (page - 1) * limit;

  // Obtener productos como objetos puros con lean()
  const products = await Product
    .find(filter)
    .sort(sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {})
    .skip(skip)
    .limit(limit)
    .lean();

  // Renderizar vista
  res.render('products', {
    products,
    pagination: { totalPages, page, hasPrev: page > 1, hasNext: page < totalPages },
    query,
    sort,
    limit,
    cartId
  });
});

// Vista de detalle de producto
router.get('/products/:pid', async (req, res) => {
  const cartId = req.query.cartId || '';
  const prod = await Product.findById(req.params.pid).lean();
  if (!prod) return res.status(404).send('Producto no encontrado');
  res.render('productDetail', { product: prod, cartId });
});

// Vista de carrito
router.get('/carts/:cid', async (req, res) => {
  const cart = await Cart.findById(req.params.cid)
    .populate('products.product')
    .lean();
  if (!cart) return res.status(404).send('Carrito no encontrado');
  res.render('cart', { cart });
});

module.exports = router;
