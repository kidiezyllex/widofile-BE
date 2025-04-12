import User from '../models/user.model.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/**
 * Login controller
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * Register controller
 */
export const register = async (req, res) => {
  try {
    const { employeeId, username, fullName, email, password, role = 'designer' } = req.body;

    // Check if user already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const existingEmployeeId = await User.findOne({ employeeId });
    if (existingEmployeeId) {
      return res.status(400).json({ message: 'Mã nhân viên đã tồn tại' });
    }

    // Create new user
    const newUser = new User({
      employeeId,
      username,
      fullName,
      email,
      password,
      role
    });

    await newUser.save();

    // Create token
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Đăng ký thành công',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

/**
 * Get user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('projects')
      .populate('tasks')
      .populate('documents');
      
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
}; 