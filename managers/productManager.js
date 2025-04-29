const fs = require('fs');
const path = require('path');

class ProductManager {
  constructor() {
    this.path = path.join(__dirname, '../products.json');
    if (!fs.existsSync(this.path)) {
      fs.writeFileSync(this.path, JSON.stringify([]));
    }
  }

  async getProducts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al leer productos:', error);
      return [];
    }
  }

  async addProduct(product) {
    try {
      const products = await this.getProducts();
      
      if (!product.title || !product.price) {
        throw new Error("El producto debe tener título y precio.");
      }

      const newId = products.length > 0 ? Math.max(...products.map(p => Number(p.id))) + 1 : 1;
      const newProduct = { id: newId, ...product };

      products.push(newProduct);
      await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));

      return newProduct;
    } catch (error) {
      console.error('Error al agregar producto:', error);
      throw error;
    }
  }
}

module.exports = ProductManager;