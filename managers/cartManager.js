const fs = require('fs');
const path = require('path');

class CartManager {
  constructor() {
    this.path = path.join(__dirname, '../carts.json');
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify([]));
    }
    this.carts = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
  }

  saveCarts() {
    fs.writeFileSync(this.path, JSON.stringify(this.carts, null, 2));
  }

  createCart() {
    const newId = this.carts.length > 0 ? Math.max(...this.carts.map(c => Number(c.id))) + 1 : 1;
    const newCart = { id: newId, products: [] };
    this.carts.push(newCart);
    this.saveCarts();
    return newCart;
  }

  getCartById(id) {
    return this.carts.find(c => c.id == id);
  }

  addProductToCart(cid, pid) {
    const cart = this.getCartById(cid);
    if (!cart) return { error: 'Carrito no encontrado' };
    const productInCart = cart.products.find(p => p.product == pid);
    if (productInCart) {
      productInCart.quantity += 1;
    } else {
      cart.products.push({ product: pid, quantity: 1 });
    }
    this.saveCarts();
    return cart;
  }
}

module.exports = CartManager;
