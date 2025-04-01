const fs = require('fs');
const path = require('path');

class ProductManager {
  constructor() {
    this.path = path.join(__dirname, '../products.json');
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify([]));
    }
    this.products = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
  }

  saveProducts() {
    fs.writeFileSync(this.path, JSON.stringify(this.products, null, 2));
  }

  getProducts() {
    this.products = JSON.parse(fs.readFileSync(this.path, 'utf-8'));
    return this.products;
  }

  getProductById(id) {
    return this.getProducts().find(p => p.id == id);
  }

  addProduct(product) {
    const newId = this.products.length > 0 ? Math.max(...this.products.map(p => Number(p.id))) + 1 : 1;
    const newProduct = { id: newId, ...product };
    this.products.push(newProduct);
    this.saveProducts();
    return newProduct;
  }

  updateProduct(id, updatedFields) {
    let product = this.getProductById(id);
    if (!product) return { error: 'Producto no encontrado' };
    for (let key in updatedFields) {
      if (key !== 'id') product[key] = updatedFields[key];
    }
    this.saveProducts();
    return product;
  }

  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id == id);
    if (index === -1) return { error: 'Producto no encontrado' };
    this.products.splice(index, 1);
    this.saveProducts();
    return { message: 'Producto eliminado' };
  }
}

module.exports = ProductManager;
