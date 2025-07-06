const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/User');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://soumyasrivastav53:DB_PASSWORD@cluster0.00wwt1p.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.get('/', (req, res) => {
    res.send('Welcome to the MongoDB CRUD API!');
});

//READ ALL USERS
app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

//READ SINGLE USER
app.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (err) {
        res.status(500).send('Error fetching user');
    }
});

//CREATE USER
app.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//UPDATE USER
app.put('/users/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedUser) return res.status(404).send('User not found');
        res.json(updatedUser);
    } catch (err) {
        res.status(500).send('Error updating user');
    }
});

//DELETE USER
app.delete('/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).send('User not found');
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).send('Error deleting user');
    }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
