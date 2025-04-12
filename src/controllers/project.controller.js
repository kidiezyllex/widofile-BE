import Project from '../models/project.model.js';
import User from '../models/user.model.js';
import Task from '../models/task.model.js';

/**
 * @desc    Tạo dự án mới
 * @route   POST /projects
 * @access  Private/Admin
 */
export const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, status, members, gameGenre, gamePlatform, thumbnail } = req.body;
    
    // Tạo project mới
    const project = new Project({
      name,
      description,
      startDate,
      endDate,
      status,
      gameGenre,
      gamePlatform,
      thumbnail
    });
    
    // Thêm người tạo vào danh sách thành viên với vai trò lead
    const creatorMember = {
      user: req.user._id,
      role: 'lead',
      joinDate: new Date()
    };
    
    if (members && Array.isArray(members)) {
      project.members = [creatorMember, ...members];
    } else {
      project.members = [creatorMember];
    }
    
    await project.save();
    
    res.status(201).json({
      success: true,
      message: 'Dự án được tạo thành công',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Lấy tất cả dự án
 * @route   GET /projects
 * @access  Private
 */
export const getProjects = async (req, res) => {
  try {
    let projects;
    
    // Admin có thể xem tất cả dự án
    if (req.user.role === 'admin') {
      projects = await Project.find()
        .populate('members.user', 'fullName avatar email employeeId')
        .sort({ createdAt: -1 });
    } else {
      // Designer chỉ có thể xem dự án họ tham gia
      projects = await Project.find({
        'members.user': req.user._id
      })
        .populate('members.user', 'fullName avatar email employeeId')
        .sort({ createdAt: -1 });
    }
    
    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Lấy thông tin dự án theo ID
 * @route   GET /projects/:id
 * @access  Private
 */
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'fullName avatar email employeeId position skills')
      .populate({
        path: 'tasks',
        options: { sort: { 'dueDate': 1 } },
        populate: { path: 'assignedTo', select: 'fullName avatar email' }
      });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin') {
      const isUserMember = project.members.some(
        member => member.user._id.toString() === req.user._id.toString()
      );
      
      if (!isUserMember) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập vào dự án này'
        });
      }
    }
    
    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Cập nhật thông tin dự án
 * @route   PUT /projects/:id
 * @access  Private/Admin/ProjectLead
 */
export const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }
    
    // Kiểm tra quyền truy cập (Admin hoặc Project Lead)
    if (req.user.role !== 'admin') {
      const isUserLead = project.members.some(
        member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
      );
      
      if (!isUserLead) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền chỉnh sửa dự án này'
        });
      }
    }
    
    // Cập nhật thông tin dự án
    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('members.user', 'fullName avatar email');
    
    res.json({
      success: true,
      message: 'Dự án được cập nhật thành công',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Xóa dự án
 * @route   DELETE /projects/:id
 * @access  Private/Admin
 */
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }
    
    // Chỉ Admin mới có quyền xóa dự án
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa dự án'
      });
    }
    
    // Xóa tất cả nhiệm vụ liên quan đến dự án
    await Task.deleteMany({ project: project._id });
    
    // Xóa dự án
    await project.deleteOne();
    
    res.json({
      success: true,
      message: 'Dự án đã được xóa thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Thêm thành viên vào dự án
 * @route   POST /projects/:id/members
 * @access  Private/Admin/ProjectLead
 */
export const addProjectMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    // Kiểm tra thông tin đầu vào
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp ID người dùng'
      });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }
    
    // Kiểm tra quyền truy cập (Admin hoặc Project Lead)
    if (req.user.role !== 'admin') {
      const isUserLead = project.members.some(
        member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
      );
      
      if (!isUserLead) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền thêm thành viên vào dự án này'
        });
      }
    }
    
    // Kiểm tra người dùng tồn tại
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    
    // Kiểm tra người dùng đã là thành viên chưa
    const existingMember = project.members.find(
      member => member.user.toString() === userId
    );
    
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'Người dùng đã là thành viên của dự án'
      });
    }
    
    // Thêm thành viên mới
    const newMember = {
      user: userId,
      role: role || 'member',
      joinDate: new Date()
    };
    
    project.members.push(newMember);
    await project.save();
    
    const updatedProject = await Project.findById(req.params.id)
      .populate('members.user', 'fullName avatar email employeeId');
    
    res.json({
      success: true,
      message: 'Thêm thành viên thành công',
      data: updatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Xóa thành viên khỏi dự án
 * @route   DELETE /projects/:id/members/:userId
 * @access  Private/Admin/ProjectLead
 */
export const removeProjectMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }
    
    // Kiểm tra quyền truy cập (Admin hoặc Project Lead)
    if (req.user.role !== 'admin') {
      const isUserLead = project.members.some(
        member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
      );
      
      if (!isUserLead) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa thành viên khỏi dự án này'
        });
      }
    }
    
    // Tìm thành viên trong dự án
    const memberIndex = project.members.findIndex(
      member => member.user.toString() === req.params.userId
    );
    
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Thành viên không tồn tại trong dự án'
      });
    }
    
    // Kiểm tra nếu là lead duy nhất thì không được xóa
    if (project.members[memberIndex].role === 'lead') {
      const leadCount = project.members.filter(member => member.role === 'lead').length;
      
      if (leadCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Không thể xóa trưởng nhóm duy nhất của dự án'
        });
      }
    }
    
    // Xóa thành viên
    project.members.splice(memberIndex, 1);
    await project.save();
    
    res.json({
      success: true,
      message: 'Đã xóa thành viên khỏi dự án',
      data: project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 