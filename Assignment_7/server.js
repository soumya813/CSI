const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 4000;

const JWT_SECRET = "your_secret_key"; // Use an environment variable in production

app.use(express.json());

let users = [];
let products = [];
let currentId = 1;

// JWT authentication middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

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
app.post("/products", authenticateJWT, (req, res) => {
  const { name, price } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ message: "Name and price are required" });
  }
  const newProduct = { id: currentId++, name, price };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

// UPDATE a product by ID
app.put("/products/:id", authenticateJWT, (req, res) => {
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
app.delete("/products/:id", authenticateJWT, (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ message: "Product not found" });
  }
  const deleted = products.splice(index, 1);
  res.json(deleted[0]);
});

// Register a new user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, username, password: hashedPassword };
  users.push(newUser);
  res.status(201).json({ message: "User registered successfully" });
});

// Login a user
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "1h",
  });
  res.json({ token });
});

// Protected route
app.get("/protected", authenticateJWT, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

app.listen(PORT, '0.0.0.0' ,() => {
  console.log(`Server running on http://localhost:${PORT}`);
});
