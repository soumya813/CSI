const express = require("express");
const app = express();
const PORT = 4000;

app.use(express.json());

let products = [];
let currentId = 1;

// GET all products
app.get("/products", (req, res) => {
  res.json(products);
});

// GET a product by ID
app.get("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  res.json(product);
});

// POST a new product
app.post("/products", (req, res) => {
  const { name, price } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ message: "Name and price are required" });
  }
  const newProduct = { id: currentId++, name, price };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// UPDATE a product by ID
app.put("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price } = req.body;
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  if (name) product.name = name;
  if (price != null) product.price = price;
  res.json(product);
});

// DELETE a product by ID
app.delete("/products/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }
  const deleted = products.splice(index, 1);
  res.json(deleted[0]);
});

app.listen(PORT, '0.0.0.0' ,() => {
  console.log(`Server running on http://localhost:${PORT}`);
});
