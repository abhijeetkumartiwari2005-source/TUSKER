import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    const authHeader =req.header('authorization');
    const authToken= authHeader.split(' ')[1];
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
    
   
  } catch (error) {
 res.status(401).json({ message: 'wrong token', error: error.message });
  }
};

export default authMiddleware;