import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const saltRounds=10;
//==signup==
router.post('/signup', async (req, res) => {
  try {
    const {email,password,name}=req.body;
   const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user =new User({ email, password: hashedPassword, name });
    await user.save();
    res.status(201).json({ message: 'User created', user: { email, name } });    
}
 catch (error) {
  if (error.code === 11000) {
    return res.status(409).json({ message: 'Email already exists' });
  }
  res.status(500).json({ message: 'Server error', error: error.message });
}
});

//==login==
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;