import process from 'node:process';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Rider from '../models/Rider.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let record = null;
    let userType = decoded.type || null;

    if (userType === 'rider') {
      record = await Rider.findByPk(decoded.id);
    } else if (userType === 'user') {
      record = await User.findByPk(decoded.id);
    } else {
      record = await User.findByPk(decoded.id);
      if (record) {
        userType = 'user';
      } else {
        record = await Rider.findByPk(decoded.id);
        if (record) {
          userType = 'rider';
        }
      }
    }

    if (!record) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.auth = {
      id: record.id,
      type: userType,
      record,
      token,
    };
    req.user = record;
    req.userType = userType;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    const normalizedRoles = roles.map((role) => String(role).toLowerCase());
    if (!normalizedRoles.includes(String(req.userType || '').toLowerCase())) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    next();
  };
};
