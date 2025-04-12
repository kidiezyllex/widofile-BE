import ForumPost from '../models/forumPost.model.js';
import Project from '../models/project.model.js';
import Comment from '../models/comment.model.js';
import Document from '../models/document.model.js';

/**
 * @desc    Tạo bài viết diễn đàn mới
 * @route   POST /forum-posts
 * @access  Private
 */
export const createForumPost = async (req, res) => {
  try {
    const { title, content, project, attachments, tags, isPinned } = req.body;
    
    // Kiểm tra dự án tồn tại
    const projectData = await Project.findById(project);
    
    if (!projectData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dự án'
      });
    }
    
    // Kiểm tra quyền truy cập dự án
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
    
    // Kiểm tra file đính kèm có thuộc về dự án không
    if (attachments && attachments.length > 0) {
      for (const docId of attachments) {
        const document = await Document.findById(docId);
        
        if (!document) {
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy tài liệu có ID: ${docId}`
          });
        }
        
        // Kiểm tra tài liệu có thuộc về dự án không hoặc người dùng có quyền truy cập không
        if (document.project && document.project.toString() !== project) {
          return res.status(400).json({
            success: false,
            message: 'Tài liệu đính kèm không thuộc về dự án này'
          });
        }
        
        // Kiểm tra người dùng có quyền truy cập tài liệu không
        if (req.user.role !== 'admin' && 
            document.creator.toString() !== req.user._id.toString() && 
            !document.isShared && 
            !document.sharedWith.includes(req.user._id)) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền đính kèm tài liệu này'
          });
        }
      }
    }
    
    // Tạo bài viết mới
    const forumPost = new ForumPost({
      title,
      content,
      author: req.user._id,
      project,
      attachments: attachments || [],
      tags: tags || [],
      isPinned: req.user.role === 'admin' ? (isPinned || false) : false
    });
    
    await forumPost.save();
    
    // Trả về bài viết đã populate
    const populatedPost = await ForumPost.findById(forumPost._id)
      .populate('author', 'fullName avatar email')
      .populate('project', 'name')
      .populate('attachments', 'title fileType');
    
    res.status(201).json({
      success: true,
      message: 'Bài viết đã được tạo thành công',
      data: populatedPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Lấy tất cả bài viết diễn đàn
 * @route   GET /forum-posts
 * @access  Private
 */
export const getForumPosts = async (req, res) => {
  try {
    const { project, author, tag, isPinned } = req.query;
    let filter = {};
    
    // Filter theo dự án
    if (project) {
      filter.project = project;
      
      // Kiểm tra quyền truy cập vào dự án
      if (req.user.role !== 'admin') {
        const projectData = await Project.findById(project);
        
        if (!projectData) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy dự án'
          });
        }
        
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
    } else {
      // Nếu không filter theo dự án, chỉ hiển thị bài viết của dự án mà người dùng tham gia
      if (req.user.role !== 'admin') {
        const userProjects = await Project.find({
          'members.user': req.user._id
        }).select('_id');
        
        filter.project = { $in: userProjects.map(p => p._id) };
      }
    }
    
    // Filter theo tác giả
    if (author) {
      filter.author = author;
    }
    
    // Filter theo tag
    if (tag) {
      filter.tags = { $in: [tag] };
    }
    
    // Filter bài ghim
    if (isPinned !== undefined) {
      filter.isPinned = isPinned === 'true';
    }
    
    // Lấy bài viết diễn đàn
    const forumPosts = await ForumPost.find(filter)
      .populate('author', 'fullName avatar')
      .populate('project', 'name')
      .populate('attachments', 'title fileType')
      .sort({ isPinned: -1, createdAt: -1 });
    
    res.json({
      success: true,
      count: forumPosts.length,
      data: forumPosts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Lấy thông tin bài viết diễn đàn theo ID
 * @route   GET /forum-posts/:id
 * @access  Private
 */
export const getForumPostById = async (req, res) => {
  try {
    // Tăng lượt xem bài viết
    await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } }
    );
    
    const forumPost = await ForumPost.findById(req.params.id)
      .populate('author', 'fullName avatar email position')
      .populate('project', 'name')
      .populate('attachments', 'title fileType filePath fileSize category')
      .populate({
        path: 'comments',
        populate: [
          { path: 'author', select: 'fullName avatar' },
          { 
            path: 'replies',
            populate: { path: 'author', select: 'fullName avatar' }
          }
        ]
      });
    
    if (!forumPost) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin') {
      const project = await Project.findById(forumPost.project);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy dự án của bài viết này'
        });
      }
      
      const isUserInProject = project.members.some(
        member => member.user.toString() === req.user._id.toString()
      );
      
      if (!isUserInProject) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xem bài viết này'
        });
      }
    }
    
    res.json({
      success: true,
      data: forumPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Cập nhật bài viết diễn đàn
 * @route   PUT /forum-posts/:id
 * @access  Private
 */
export const updateForumPost = async (req, res) => {
  try {
    const forumPost = await ForumPost.findById(req.params.id);
    
    if (!forumPost) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && forumPost.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật bài viết này'
      });
    }
    
    // Chỉ Admin mới có thể ghim bài viết
    if (req.body.isPinned !== undefined && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Admin mới có quyền ghim bài viết'
      });
    }
    
    // Kiểm tra file đính kèm
    if (req.body.attachments && req.body.attachments.length > 0) {
      for (const docId of req.body.attachments) {
        const document = await Document.findById(docId);
        
        if (!document) {
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy tài liệu có ID: ${docId}`
          });
        }
        
        // Kiểm tra tài liệu có thuộc về dự án không
        if (document.project && document.project.toString() !== forumPost.project.toString()) {
          return res.status(400).json({
            success: false,
            message: 'Tài liệu đính kèm không thuộc về dự án này'
          });
        }
        
        // Kiểm tra người dùng có quyền truy cập tài liệu không
        if (req.user.role !== 'admin' && 
            document.creator.toString() !== req.user._id.toString() && 
            !document.isShared && 
            !document.sharedWith.includes(req.user._id)) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền đính kèm tài liệu này'
          });
        }
      }
    }
    
    // Cập nhật bài viết
    const updatedForumPost = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    )
      .populate('author', 'fullName avatar')
      .populate('project', 'name')
      .populate('attachments', 'title fileType');
    
    res.json({
      success: true,
      message: 'Cập nhật bài viết thành công',
      data: updatedForumPost
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Xóa bài viết diễn đàn
 * @route   DELETE /forum-posts/:id
 * @access  Private
 */
export const deleteForumPost = async (req, res) => {
  try {
    const forumPost = await ForumPost.findById(req.params.id);
    
    if (!forumPost) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài viết'
      });
    }
    
    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin' && forumPost.author.toString() !== req.user._id.toString()) {
      // Kiểm tra xem người dùng có phải là lead của dự án không
      const project = await Project.findById(forumPost.project);
      const isProjectLead = project && project.members.some(
        member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
      );
      
      if (!isProjectLead) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa bài viết này'
        });
      }
    }
    
    // Xóa tất cả bình luận của bài viết
    await Comment.deleteMany({ forumPost: forumPost._id });
    
    // Xóa bài viết
    await forumPost.deleteOne();
    
    res.json({
      success: true,
      message: 'Xóa bài viết thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 