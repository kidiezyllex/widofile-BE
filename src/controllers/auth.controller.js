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
      return res.status(401).json({
        status: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng',
        data: null,
        errors: {},
        timestamp: new Date().toISOString()
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng',
        data: null,
        errors: {},
        timestamp: new Date().toISOString()
      });
    }

    // Create token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      status: true,
      message: 'Đăng nhập thành công',
      data: {
        _id: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        password: '',
        role: user.role,
        token: token
      },
      errors: {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Lỗi server',
      data: null,
      errors: { server: error.message },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Register controller
 */
export const register = async (req, res) => {
  try {
    const { username, fullName, email, password, role = 'employee' } = req.body;

    // Check if user already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        status: false,
        message: 'Tên đăng nhập đã tồn tại',
        data: null,
        errors: {},
        timestamp: new Date().toISOString()
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        status: false,
        message: 'Email đã tồn tại',
        data: null,
        errors: {},
        timestamp: new Date().toISOString()
      });
    }

    // Create new user - employeeId sẽ được tự động tạo trong middleware
    const newUser = new User({
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
      status: true,
      message: 'Đăng ký thành công',
      data: {
        _id: newUser._id,
        username: newUser.username,
        fullName: newUser.fullName,
        email: newUser.email,
        password: '',
        role: newUser.role,
        token: token
      },
      errors: {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Lỗi server',
      data: null,
      errors: { server: error.message },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get user profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('projects')
      .populate('tasks')
      .populate('documents');
      
    if (!user) {
      return res.status(404).json({
        status: false,
        message: 'Không tìm thấy người dùng',
        data: null,
        errors: {},
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      status: true,
      message: 'Lấy thông tin người dùng thành công',
      data: user,
      errors: {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Lỗi server',
      data: null,
      errors: { server: error.message },
      timestamp: new Date().toISOString()
    });
  }
}; 