const express = require('express');
  const { create } = require('express-handlebars');
const path = require('path');
const http = require('http');

const { Server } = require('socket.io');

const productRoutes = require('./routes/products');

const ProductManager = require('./managers/productManager');

const app = express();
 const server = http.createServer(app);
const io = new Server(server);

const hbs = create({
  defaultLayout: 'main',
  extname: '.handlebars',
});

  app.engine('.handlebars', hbs.engine);
app.set('view engine', '.handlebars');
 app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public')); 
app.use(express.json());

    const productManager = new ProductManager();

app.get('/', async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render('home', { products });
  } catch (error) {
           console.error('Error al renderizar home:', error);
    res.status(500).send('Error al cargar la página');
  }
});

 app.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts');
});

app.use('/api/products', productRoutes);

io.on('connection', (socket) => {
  console.log('Cliente conectado');

       socket.on('new-product', async (product) => {
    try {
      const newProduct = await productManager.addProduct(product);
      io.emit('product-update', await productManager.getProducts());
    }    catch (error) {
      console.error('Error al agregar producto:', error);
    }
  });
});

        server.listen(8080, () => console.log('Servidor corriendo en el puerto 8080'));