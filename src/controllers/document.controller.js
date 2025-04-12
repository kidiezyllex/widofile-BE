import Document from '../models/document.model.js';
import Project from '../models/project.model.js';
import Task from '../models/task.model.js';

/**
 * @desc    Tải tài liệu lên
 * @route   POST /documents
 * @access  Private
 */
export const uploadDocument = async (req, res) => {
  try {
    const { 
      title, description, category, project, task, 
      filePath, fileType, fileSize, version, tags, isShared, sharedWith 
    } = req.body;
    
    // Kiểm tra quyền truy cập dự án nếu tài liệu thuộc dự án
    if (project) {
      const projectData = await Project.findById(project);
      
      if (!projectData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dự án'
        });
      }
      
      if (req.user.role !== 'admin') {
        const isUserInProject = projectData.members.some(
          member => member.user.toString() === req.user._id.toString()
        );
        
        if (!isUserInProject) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không phải là thành viên của dự án này'
          });
        }
      }
    }
    
    // Kiểm tra quyền truy cập nhiệm vụ nếu tài liệu thuộc nhiệm vụ
    if (task) {
      const taskData = await Task.findById(task);
      
      if (!taskData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhiệm vụ'
        });
      }
      
      if (req.user.role !== 'admin') {
        // Kiểm tra người dùng có thuộc dự án của nhiệm vụ không
        const projectData = await Project.findById(taskData.project);
        
        if (!projectData) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy dự án của nhiệm vụ này'
          });
        }
        
        const isUserInProject = projectData.members.some(
          member => member.user.toString() === req.user._id.toString()
        );
        
        if (!isUserInProject) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không phải là thành viên của dự án chứa nhiệm vụ này'
          });
        }
      }
    }
    
    // Tạo tài liệu mới
    const document = new Document({
      title,
      description,
      category,
      project,
      task,
      creator: req.user._id,
      filePath,
      fileType,
      fileSize,
      version,
      isShared,
      sharedWith,
      tags
    });
    
    await document.save();
    
    // Trả về tài liệu đã populate
    const populatedDocument = await Document.findById(document._id)
      .populate('category', 'name')
      .populate('creator', 'fullName avatar')
      .populate('project', 'name')
      .populate('task', 'title');
    
    res.status(201).json({
      success: true,
      message: 'Tài liệu đã được tải lên thành công',
      data: populatedDocument
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Lấy tất cả tài liệu
 * @route   GET /documents
 * @access  Private
 */
export const getDocuments = async (req, res) => {
  try {
    const { project, category, creator, task, search, isShared } = req.query;
    let filter = {};
    
    // Filter theo dự án
    if (project) {
      filter.project = project;
    }
    
    // Filter theo danh mục
    if (category) {
      filter.category = category;
    }
    
    // Filter theo người tạo
    if (creator) {
      filter.creator = creator;
    }
    
    // Filter theo nhiệm vụ
    if (task) {
      filter.task = task;
    }
    
    // Filter theo trạng thái chia sẻ
    if (isShared !== undefined) {
      filter.isShared = isShared === 'true';
    }
    
    // Tìm kiếm theo tiêu đề, mô tả hoặc tag
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Lọc theo quyền truy cập
    if (req.user.role !== 'admin') {
      // employee có thể xem:
      // 1. Tài liệu họ tạo
      // 2. Tài liệu được chia sẻ cho họ
      // 3. Tài liệu thuộc dự án họ tham gia
      // 4. Tài liệu công khai (isShared = true)
      
      // Lấy danh sách dự án của người dùng
      const userProjects = await Project.find({
        'members.user': req.user._id
      }).select('_id');
      
      const projectIds = userProjects.map(p => p._id);
      
      // Thêm điều kiện lọc theo quyền truy cập
      filter.$or = [
        { creator: req.user._id },
        { sharedWith: { $in: [req.user._id] } },
        { project: { $in: projectIds } },
        { isShared: true }
      ];
      
      // Nếu đã có điều kiện tìm kiếm $or từ search, thêm điều kiện $and
      if (search) {
        const searchConditions = filter.$or;
        filter.$or = undefined;
        
        filter.$and = [
          { $or: searchConditions },
          {
            $or: [
              { creator: req.user._id },
              { sharedWith: { $in: [req.user._id] } },
              { project: { $in: projectIds } },
              { isShared: true }
            ]
          }
        ];
      }
    }
    
    // Thực hiện truy vấn
    const documents = await Document.find(filter)
      .populate('category', 'name')
      .populate('creator', 'fullName avatar')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Lấy thông tin tài liệu theo ID
 * @route   GET /documents/:id
 * @access  Private
 */
export const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('category', 'name')
      .populate('creator', 'fullName avatar email')
      .populate('project', 'name')
      .populate('task', 'title')
      .populate('sharedWith', 'fullName avatar')
      .populate({
        path: 'comments',
        populate: { path: 'author', select: 'fullName avatar' }
      });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin') {
      const isCreator = document.creator._id.toString() === req.user._id.toString();
      const isSharedWith = document.sharedWith.some(user => user._id.toString() === req.user._id.toString());
      
      let isInProject = false;
      if (document.project) {
        const project = await Project.findById(document.project);
        if (project) {
          isInProject = project.members.some(
            member => member.user.toString() === req.user._id.toString()
          );
        }
      }
      
      if (!isCreator && !isSharedWith && !isInProject && !document.isShared) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem tài liệu này'
        });
      }
    }
    
    res.json({
      success: true,
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Cập nhật thông tin tài liệu
 * @route   PUT /documents/:id
 * @access  Private
 */
export const updateDocument = async (req, res) => {
  try {
    let document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }
    
    // Kiểm tra quyền truy cập
    // Chỉ admin, người tạo tài liệu hoặc lead của dự án mới có quyền cập nhật
    if (req.user.role !== 'admin' && document.creator.toString() !== req.user._id.toString()) {
      // Nếu tài liệu thuộc dự án, kiểm tra người dùng có phải lead không
      let isProjectLead = false;
      
      if (document.project) {
        const project = await Project.findById(document.project);
        if (project) {
          isProjectLead = project.members.some(
            member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
          );
        }
      }
      
      if (!isProjectLead) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền cập nhật tài liệu này'
        });
      }
    }
    
    // Cập nhật thông tin tài liệu
    document = await Document.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('category', 'name')
      .populate('creator', 'fullName avatar')
      .populate('project', 'name')
      .populate('task', 'title')
      .populate('sharedWith', 'fullName avatar');
    
    res.json({
      success: true,
      message: 'Cập nhật tài liệu thành công',
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Xóa tài liệu
 * @route   DELETE /documents/:id
 * @access  Private
 */
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && document.creator.toString() !== req.user._id.toString()) {
      let isProjectLead = false;
      
      if (document.project) {
        const project = await Project.findById(document.project);
        if (project) {
          isProjectLead = project.members.some(
            member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
          );
        }
      }
      
      if (!isProjectLead) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa tài liệu này'
        });
      }
    }
    
    await document.deleteOne();
    
    res.json({
      success: true,
      message: 'Xóa tài liệu thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Chia sẻ tài liệu với người dùng khác
 * @route   POST /documents/:id/share
 * @access  Private
 */
export const shareDocument = async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp danh sách người dùng để chia sẻ'
      });
    }
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && document.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền chia sẻ tài liệu này'
      });
    }
    
    // Thêm người dùng vào danh sách chia sẻ
    document.sharedWith = [...new Set([...document.sharedWith.map(id => id.toString()), ...userIds])];
    
    // Đánh dấu tài liệu đã được chia sẻ
    document.isShared = true;
    
    await document.save();
    
    const updatedDocument = await Document.findById(req.params.id)
      .populate('sharedWith', 'fullName avatar email');
    
    res.json({
      success: true,
      message: 'Chia sẻ tài liệu thành công',
      data: updatedDocument
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Hủy chia sẻ tài liệu với người dùng
 * @route   DELETE /documents/:id/share/:userId
 * @access  Private
 */
export const unshareDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tài liệu'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && document.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền hủy chia sẻ tài liệu này'
      });
    }
    
    // Xóa người dùng khỏi danh sách chia sẻ
    document.sharedWith = document.sharedWith.filter(
      userId => userId.toString() !== req.params.userId
    );
    
    // Nếu không còn ai được chia sẻ, đánh dấu isShared = false
    if (document.sharedWith.length === 0) {
      document.isShared = false;
    }
    
    await document.save();
    
    res.json({
      success: true,
      message: 'Hủy chia sẻ tài liệu thành công',
      data: document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 