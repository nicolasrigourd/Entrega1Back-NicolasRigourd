// routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products — Listado profesional con filtros, paginación y ordenamiento
router.get('/', async (req, res) => {
  try {
    // 1. Parámetros
    const limit = parseInt(req.query.limit) || 10;
    const page  = parseInt(req.query.page)  || 1;
    const sort  = req.query.sort;           // 'asc' o 'desc'
    const query = req.query.query;          // categoría o 'true'/'false' para status

    // 2. Construir filtro
    const filter = {};
    if (query) {
      if (query === 'true' || query === 'false') {
        filter.status = query === 'true';
      } else {
        filter.category = query;
      }
    }

    // 3. Calcular total y páginas
    const totalDocs  = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);
    const skip       = (page - 1) * limit;

    // 4. Ejecutar consulta con skip, limit y sort
    let mongoQuery = Product.find(filter);
    if (sort === 'asc' || sort === 'desc') {
      mongoQuery = mongoQuery.sort({ price: sort === 'asc' ? 1 : -1 });
    }
    const products = await mongoQuery.skip(skip).limit(limit);

    // 5. Crear información de páginas
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    // 6. Función para generar enlaces
    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const buildLink = p => {
      const params = new URLSearchParams();
      params.set('limit', limit);
      params.set('page', p);
      if (query) params.set('query', query);
      if (sort)  params.set('sort', sort);
      return `${baseUrl}?${params.toString()}`;
    };

    // 7. Respuesta estructurada
    return res.json({
      status: 'success',
      payload: products,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? buildLink(prevPage) : null,
      nextLink: hasNextPage ? buildLink(nextPage) : null
    });
  } catch (err) {
    console.error('Error en GET /api/products →', err);
    return res.status(500).json({ status: 'error', error: 'Error al obtener productos' });
  }
});

// GET /api/products/:pid — Traer un producto por ID
router.get('/:pid', async (req, res) => {
  try {
    const product = await Product.findById(req.params.pid);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json(product);
  } catch (err) {
    console.error(`Error en GET /api/products/${req.params.pid} →`, err);
    return res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

// POST /api/products — Agregar un nuevo producto
router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    return res.status(201).json(newProduct);
  } catch (err) {
    console.error('Error en POST /api/products →', err);
    return res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:pid — Actualizar un producto (sin tocar el _id)
router.put('/:pid', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.pid,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json(updated);
  } catch (err) {
    console.error(`Error en PUT /api/products/${req.params.pid} →`, err);
    return res.status(400).json({ error: err.message });
  }
});

// DELETE /api/products/:pid — Eliminar un producto
router.delete('/:pid', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.pid);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error(`Error en DELETE /api/products/${req.params.pid} →`, err);
    return res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

module.exports = router;
