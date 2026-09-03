import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const router = express.Router();
const saltRounds=10;

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

export default router;