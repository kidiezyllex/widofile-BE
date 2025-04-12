import Comment from '../models/comment.model.js';
import ForumPost from '../models/forumPost.model.js';
import Task from '../models/task.model.js';
import Document from '../models/document.model.js';
import User from '../models/user.model.js';
import Project from '../models/project.model.js';

/**
 * @desc    Tạo bình luận mới
 * @route   POST /comments
 * @access  Private
 */
export const createComment = async (req, res) => {
  try {
    const { content, forumPost, task, document, user, parentComment } = req.body;
    
    // Kiểm tra nội dung bình luận
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }
    
    // Kiểm tra đối tượng bình luận, chỉ cho phép bình luận một đối tượng
    const commentTargets = [forumPost, task, document, user].filter(Boolean);
    
    if (commentTargets.length !== 1) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chỉ định một đối tượng để bình luận'
      });
    }
    
    // Kiểm tra quyền truy cập đối tượng bình luận
    if (forumPost) {
      const postData = await ForumPost.findById(forumPost).populate('project');
      
      if (!postData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }
      
      // Kiểm tra người dùng có thuộc dự án không
      if (req.user.role !== 'admin') {
        const project = await Project.findById(postData.project);
        
        if (!project) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy dự án của bài viết'
          });
        }
        
        const isUserInProject = project.members.some(
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
    
    if (task) {
      const taskData = await Task.findById(task).populate('project');
      
      if (!taskData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhiệm vụ'
        });
      }
      
      // Kiểm tra người dùng có thuộc dự án không
      if (req.user.role !== 'admin') {
        const project = await Project.findById(taskData.project);
        
        if (!project) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy dự án của nhiệm vụ'
          });
        }
        
        const isUserInProject = project.members.some(
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
    
    if (document) {
      const docData = await Document.findById(document);
      
      if (!docData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài liệu'
        });
      }
      
      // Kiểm tra quyền truy cập tài liệu
      if (req.user.role !== 'admin') {
        const isCreator = docData.creator.toString() === req.user._id.toString();
        const isSharedWith = docData.sharedWith.some(id => id.toString() === req.user._id.toString());
        
        // Kiểm tra tài liệu có thuộc dự án người dùng không
        let isInProject = false;
        if (docData.project) {
          const project = await Project.findById(docData.project);
          if (project) {
            isInProject = project.members.some(
              member => member.user.toString() === req.user._id.toString()
            );
          }
        }
        
        if (!isCreator && !isSharedWith && !isInProject && !docData.isShared) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền bình luận về tài liệu này'
          });
        }
      }
    }
    
    if (user) {
      const userData = await User.findById(user);
      
      if (!userData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy người dùng'
        });
      }
      
      // Kiểm tra người dùng có cùng dự án với người được bình luận không
      if (req.user.role !== 'admin' && user !== req.user._id.toString()) {
        // Lấy danh sách dự án của người dùng hiện tại
        const userProjects = await Project.find({
          'members.user': req.user._id
        }).select('_id members');
        
        // Kiểm tra người được bình luận có thuộc dự án nào của người dùng không
        const hasCommonProject = userProjects.some(project => 
          project.members.some(member => member.user.toString() === user)
        );
        
        if (!hasCommonProject) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không thể bình luận về người dùng này vì không cùng dự án'
          });
        }
      }
    }
    
    // Kiểm tra bình luận cha (nếu có)
    if (parentComment) {
      const parentCommentData = await Comment.findById(parentComment);
      
      if (!parentCommentData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bình luận cha'
        });
      }
      
      // Đảm bảo bình luận con cùng đối tượng với bình luận cha
      if (forumPost && parentCommentData.forumPost && parentCommentData.forumPost.toString() !== forumPost) {
        return res.status(400).json({
          success: false,
          message: 'Bình luận con phải thuộc cùng bài viết với bình luận cha'
        });
      }
      
      if (task && parentCommentData.task && parentCommentData.task.toString() !== task) {
        return res.status(400).json({
          success: false,
          message: 'Bình luận con phải thuộc cùng nhiệm vụ với bình luận cha'
        });
      }
      
      if (document && parentCommentData.document && parentCommentData.document.toString() !== document) {
        return res.status(400).json({
          success: false,
          message: 'Bình luận con phải thuộc cùng tài liệu với bình luận cha'
        });
      }
      
      if (user && parentCommentData.user && parentCommentData.user.toString() !== user) {
        return res.status(400).json({
          success: false,
          message: 'Bình luận con phải thuộc cùng người dùng với bình luận cha'
        });
      }
    }
    
    // Tạo bình luận mới
    const comment = new Comment({
      content,
      author: req.user._id,
      forumPost,
      task,
      document,
      user,
      parentComment
    });
    
    await comment.save();
    
    // Trả về bình luận đã populate
    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'fullName avatar');
    
    res.status(201).json({
      success: true,
      message: 'Bình luận đã được tạo thành công',
      data: populatedComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Lấy tất cả bình luận theo đối tượng
 * @route   GET /comments
 * @access  Private
 */
export const getComments = async (req, res) => {
  try {
    const { forumPost, task, document, user, parentComment } = req.query;
    
    // Tạo filter theo đối tượng bình luận
    let filter = {};
    
    if (forumPost) {
      filter.forumPost = forumPost;
      
      // Kiểm tra quyền truy cập bài viết
      const post = await ForumPost.findById(forumPost).populate('project');
      
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy bài viết'
        });
      }
      
      if (req.user.role !== 'admin') {
        const project = await Project.findById(post.project);
        
        if (!project) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy dự án của bài viết'
          });
        }
        
        const isUserInProject = project.members.some(
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
    
    if (task) {
      filter.task = task;
      
      // Kiểm tra quyền truy cập nhiệm vụ
      const taskData = await Task.findById(task).populate('project');
      
      if (!taskData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy nhiệm vụ'
        });
      }
      
      if (req.user.role !== 'admin') {
        const project = await Project.findById(taskData.project);
        
        if (!project) {
          return res.status(404).json({
            success: false,
            message: 'Không tìm thấy dự án của nhiệm vụ'
          });
        }
        
        const isUserInProject = project.members.some(
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
    
    if (document) {
      filter.document = document;
      
      // Kiểm tra quyền truy cập tài liệu
      const docData = await Document.findById(document);
      
      if (!docData) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài liệu'
        });
      }
      
      if (req.user.role !== 'admin') {
        const isCreator = docData.creator.toString() === req.user._id.toString();
        const isSharedWith = docData.sharedWith.some(id => id.toString() === req.user._id.toString());
        
        let isInProject = false;
        if (docData.project) {
          const project = await Project.findById(docData.project);
          if (project) {
            isInProject = project.members.some(
              member => member.user.toString() === req.user._id.toString()
            );
          }
        }
        
        if (!isCreator && !isSharedWith && !isInProject && !docData.isShared) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không có quyền xem bình luận của tài liệu này'
          });
        }
      }
    }
    
    if (user) {
      filter.user = user;
      
      // Kiểm tra người dùng có cùng dự án với người bình luận không
      if (req.user.role !== 'admin' && user !== req.user._id.toString()) {
        const userProjects = await Project.find({
          'members.user': req.user._id
        }).select('_id members');
        
        const hasCommonProject = userProjects.some(project => 
          project.members.some(member => member.user.toString() === user)
        );
        
        if (!hasCommonProject) {
          return res.status(403).json({
            success: false,
            message: 'Bạn không thể xem bình luận về người dùng này vì không cùng dự án'
          });
        }
      }
    }
    
    // Lọc theo bình luận cha hoặc bình luận gốc
    if (parentComment) {
      filter.parentComment = parentComment;
    } else {
      filter.parentComment = { $exists: false };
    }
    
    // Lấy danh sách bình luận
    const comments = await Comment.find(filter)
      .populate('author', 'fullName avatar')
      .sort({ createdAt: 1 });
    
    res.json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Cập nhật bình luận
 * @route   PUT /comments/:id
 * @access  Private
 */
export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }
    
    // Kiểm tra quyền truy cập (chỉ người tạo bình luận hoặc admin mới có quyền cập nhật)
    if (req.user.role !== 'admin' && comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật bình luận này'
      });
    }
    
    // Chỉ cho phép cập nhật nội dung bình luận
    if (req.body.content) {
      comment.content = req.body.content;
      await comment.save();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Nội dung bình luận không được để trống'
      });
    }
    
    res.json({
      success: true,
      message: 'Cập nhật bình luận thành công',
      data: comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Xóa bình luận
 * @route   DELETE /comments/:id
 * @access  Private
 */
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bình luận'
      });
    }
    
    // Kiểm tra quyền truy cập
    let hasPermission = false;
    
    // Admin có quyền xóa mọi bình luận
    if (req.user.role === 'admin') {
      hasPermission = true;
    }
    
    // Người tạo bình luận có quyền xóa bình luận của mình
    if (comment.author.toString() === req.user._id.toString()) {
      hasPermission = true;
    }
    
    // Trưởng nhóm dự án có quyền xóa bình luận trong dự án của mình
    if (!hasPermission) {
      if (comment.forumPost) {
        const post = await ForumPost.findById(comment.forumPost);
        if (post && post.project) {
          const project = await Project.findById(post.project);
          if (project) {
            const isUserLead = project.members.some(
              member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
            );
            
            if (isUserLead) {
              hasPermission = true;
            }
          }
        }
      }
      
      if (comment.task) {
        const task = await Task.findById(comment.task);
        if (task && task.project) {
          const project = await Project.findById(task.project);
          if (project) {
            const isUserLead = project.members.some(
              member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
            );
            
            if (isUserLead) {
              hasPermission = true;
            }
          }
        }
      }
      
      if (comment.document) {
        const document = await Document.findById(comment.document);
        if (document && document.project) {
          const project = await Project.findById(document.project);
          if (project) {
            const isUserLead = project.members.some(
              member => member.user.toString() === req.user._id.toString() && member.role === 'lead'
            );
            
            if (isUserLead) {
              hasPermission = true;
            }
          }
        }
      }
    }
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa bình luận này'
      });
    }
    
    // Xóa tất cả bình luận con nếu có
    await Comment.deleteMany({ parentComment: comment._id });
    
    // Xóa bình luận
    await comment.deleteOne();
    
    res.json({
      success: true,
      message: 'Xóa bình luận thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 