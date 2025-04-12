import Task from '../models/task.model.js';
import Project from '../models/project.model.js';

/**
 * @desc    Tạo nhiệm vụ mới
 * @route   POST /tasks
 * @access  Private/Admin/ProjectLead
 */
export const createTask = async (req, res) => {
  try {
    const { 
      title, description, project, phase, assignedTo, 
      startDate, dueDate, status, priority 
    } = req.body;
    
    // Kiểm tra project tồn tại
    const projectData = await Project.findById(project);
    
    if (!projectData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin') {
      const isUserLead = projectData.members.some(
        member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
      );
      
      if (!isUserLead) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền tạo nhiệm vụ cho dự án này'
        });
      }
    }
    
    // Kiểm tra người được giao nhiệm vụ có thuộc dự án không
    if (assignedTo) {
      const isAssignedUserInProject = projectData.members.some(
        member => member.user.toString() === assignedTo
      );
      
      if (!isAssignedUserInProject) {
        return res.status(400).json({
          success: false,
          message: 'Người được giao nhiệm vụ không thuộc dự án'
        });
      }
    }
    
    // Tạo nhiệm vụ mới
    const task = new Task({
      title,
      description,
      project,
      phase,
      assignedTo: assignedTo || req.user._id,
      startDate,
      dueDate,
      status,
      priority
    });
    
    await task.save();
    
    // Trả về dữ liệu đã được populate
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'fullName avatar email')
      .populate('project', 'name');
    
    res.status(201).json({
      success: true,
      message: 'Nhiệm vụ đã được tạo thành công',
      data: populatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Lấy tất cả nhiệm vụ
 * @route   GET /tasks
 * @access  Private
 */
export const getTasks = async (req, res) => {
  try {
    const { project, status, phase, assignedTo } = req.query;
    let filter = {};
    
    // Filter theo dự án
    if (project) {
      filter.project = project;
    }
    
    // Filter theo trạng thái
    if (status) {
      filter.status = status;
    }
    
    // Filter theo giai đoạn
    if (phase) {
      filter.phase = phase;
    }
    
    // Filter theo người được giao
    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }
    
    // Admin có thể xem tất cả nhiệm vụ
    if (req.user.role !== 'admin') {
      // Designer chỉ có thể xem nhiệm vụ của dự án họ tham gia
      const userProjects = await Project.find({
        'members.user': req.user._id
      }).select('_id');
      
      const projectIds = userProjects.map(p => p._id);
      
      // Thêm điều kiện filter theo dự án của người dùng
      if (project) {
        // Nếu đã filter theo dự án, kiểm tra dự án có thuộc về người dùng không
        if (!projectIds.some(id => id.toString() === project)) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền xem nhiệm vụ của dự án này'
          });
        }
      } else {
        // Nếu không filter theo dự án, chỉ hiển thị nhiệm vụ của các dự án người dùng tham gia
        filter.project = { $in: projectIds };
      }
    }
    
    const tasks = await Task.find(filter)
      .populate('assignedTo', 'fullName avatar email')
      .populate('project', 'name status')
      .sort({ dueDate: 1 });
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Lấy nhiệm vụ theo ID
 * @route   GET /tasks/:id
 * @access  Private
 */
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'fullName avatar email')
      .populate('project', 'name status members')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'fullName avatar' }
      })
      .populate({
        path: 'notes',
        populate: { path: 'author', select: 'fullName avatar' }
      });
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhiệm vụ'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin') {
      const project = await Project.findById(task.project);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dự án của nhiệm vụ này'
        });
      }
      
      const isUserInProject = project.members.some(
        member => member.user.toString() === req.user._id.toString()
      );
      
      if (!isUserInProject) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem nhiệm vụ này'
        });
      }
    }
    
    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Cập nhật nhiệm vụ
 * @route   PUT /tasks/:id
 * @access  Private
 */
export const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhiệm vụ'
      });
    }
    
    // Kiểm tra quyền truy cập
    const project = await Project.findById(task.project);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án của nhiệm vụ này'
      });
    }
    
    // Admin hoặc Project Lead có quyền cập nhật toàn bộ
    let hasFullAccess = false;
    
    if (req.user.role === 'admin') {
      hasFullAccess = true;
    } else {
      const isUserLead = project.members.some(
        member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
      );
      
      if (isUserLead) {
        hasFullAccess = true;
      }
    }
    
    // Người được giao nhiệm vụ chỉ có thể cập nhật status và progress
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();
    
    if (!hasFullAccess && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật nhiệm vụ này'
      });
    }
    
    // Người được giao nhiệm vụ chỉ có thể cập nhật trạng thái và tiến độ
    if (!hasFullAccess && isAssignee) {
      const allowedFields = ['status', 'progress', 'completedDate'];
      const requestFields = Object.keys(req.body);
      
      const hasUnallowedField = requestFields.some(field => !allowedFields.includes(field));
      
      if (hasUnallowedField) {
        return res.status(403).json({
          success: false,
          message: 'Bạn chỉ có quyền cập nhật trạng thái và tiến độ của nhiệm vụ'
        });
      }
    }
    
    // Cập nhật nhiệm vụ
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('assignedTo', 'fullName avatar email')
      .populate('project', 'name status');
    
    res.json({
      success: true,
      message: 'Cập nhật nhiệm vụ thành công',
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Xóa nhiệm vụ
 * @route   DELETE /tasks/:id
 * @access  Private/Admin/ProjectLead
 */
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhiệm vụ'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin') {
      const project = await Project.findById(task.project);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dự án của nhiệm vụ này'
        });
      }
      
      const isUserLead = project.members.some(
        member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
      );
      
      if (!isUserLead) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa nhiệm vụ này'
        });
      }
    }
    
    await task.deleteOne();
    
    res.json({
      success: true,
      message: 'Xóa nhiệm vụ thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 