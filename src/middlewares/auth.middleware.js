import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import config from '../config/config.js';

dotenv.config();

/**
 * Middleware xác thực người dùng
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Lấy token từ Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Kiểm tra token tồn tại
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không có token, từ chối truy cập'
      });
    }
    
    // Xác thực token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Tìm người dùng từ token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }
    
    // Kiểm tra tài khoản có hoạt động không
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }
    
    // Gán thông tin người dùng vào request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }
    
    console.error('Lỗi xác thực:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * Middleware kiểm tra vai trò admin
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập, chỉ Admin mới có quyền'
    });
  }
};

/**
 * Middleware kiểm tra vai trò designer
 */
export const isDesigner = (req, res, next) => {
  if (req.user && req.user.role === 'designer') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập, chỉ Designer mới có quyền'
    });
  }
};

/**
 * Middleware kiểm tra đảm bảo người dùng là thành viên của dự án
 */
export const isProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID dự án'
      });
    }
    
    // Nếu là admin, cho phép truy cập không cần kiểm tra
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Kiểm tra người dùng có phải là thành viên của dự án không
    const Project = mongoose.model('Project');
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Dự án không tồn tại'
      });
    }
    
    const isMember = project.members.some(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải là thành viên của dự án này'
      });
    }
    
    next();
  } catch (error) {
    console.error('Lỗi kiểm tra thành viên dự án:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * Middleware kiểm tra người dùng là trưởng nhóm dự án (project lead)
 */
export const isProjectLead = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project;
    
    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu ID dự án'
      });
    }
    
    // Nếu là admin, cho phép truy cập không cần kiểm tra
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Kiểm tra người dùng có phải là lead của dự án không
    const Project = mongoose.model('Project');
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Dự án không tồn tại'
      });
    }
    
    const isLead = project.members.some(
      member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
    );
    
    if (!isLead) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không phải là trưởng nhóm của dự án này'
      });
    }
    
    next();
  } catch (error) {
    console.error('Lỗi kiểm tra trưởng nhóm dự án:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * Middleware kiểm tra vai trò admin hoặc designer
 */
export const isAdminOrDesigner = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'designer')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập, chỉ Admin hoặc Designer mới có quyền'
    });
  }
};

/**
 * Middleware kiểm tra coordinator chỉ truy cập dữ liệu thuộc ngành mình
 */
export const checkDepartmentAccess = async (req, res, next) => {
  try {
    // Nếu là admin, cho phép truy cập tất cả
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Nếu là coordinator, kiểm tra ngành
    if (req.user.role === 'coordinator') {
      const departmentId = req.params.departmentId || req.body.department;
      
      // Nếu không có departmentId, cho phép truy cập (sẽ được xử lý trong controller)
      if (!departmentId) {
        return next();
      }
      
      const userDepartment = req.user.department ? req.user.department.toString() : null;
      
      // Kiểm tra xem người dùng có thuộc ngành được truy cập không
      if (userDepartment !== departmentId) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền truy cập dữ liệu của ngành khác'
        });
      }
      
      return next();
    }
    
    // Nếu vai trò khác, từ chối truy cập
    res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập'
    });
  } catch (error) {
    console.error('Lỗi kiểm tra quyền truy cập ngành:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}; 