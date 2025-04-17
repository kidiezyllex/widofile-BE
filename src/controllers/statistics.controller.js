import User from '../models/user.model.js';
import Project from '../models/project.model.js';
import Document from '../models/document.model.js';
import ForumPost from '../models/forumPost.model.js';
import Comment from '../models/comment.model.js';

// Thống kê tổng quan
export const getOverviewStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'in-progress' });
    const totalDocuments = await Document.countDocuments();
    const totalForumPosts = await ForumPost.countDocuments();
    
    res.json({
      totalUsers,
      totalProjects,
      activeProjects,
      totalDocuments,
      totalForumPosts
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thống kê tổng quan', error: error.message });
  }
};

// Thống kê người dùng
export const getUserStatistics = async (req, res) => {
  try {
    const usersByDepartment = await User.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const usersByPosition = await User.aggregate([
      { $group: { _id: '$position', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const usersJoinedByMonth = await User.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$joinDate' }, 
            month: { $month: '$joinDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      usersByDepartment,
      usersByPosition,
      usersByRole,
      usersJoinedByMonth
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thống kê người dùng', error: error.message });
  }
};

// Thống kê dự án
export const getProjectStatistics = async (req, res) => {
  try {
    const projectsByStatus = await Project.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    const projectsCreatedByMonth = await Project.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    const projectsByGenre = await Project.aggregate([
      { 
        $match: { 
          gameGenre: { $exists: true, $ne: null, $ne: "" }
        } 
      },
      { $group: { _id: '$gameGenre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const projectsByPlatform = await Project.aggregate([
      { 
        $match: { 
          gamePlatform: { $exists: true, $ne: null, $ne: "" }
        } 
      },
      { $group: { _id: '$gamePlatform', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({
      projectsByStatus,
      projectsCreatedByMonth,
      projectsByGenre,
      projectsByPlatform
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thống kê dự án', error: error.message });
  }
};

// Thống kê tài liệu
export const getDocumentStatistics = async (req, res) => {
  try {
    const documentsByType = await Document.aggregate([
      { $group: { _id: '$fileType', count: { $sum: 1 }, totalSize: { $sum: '$fileSize' } } },
      { $sort: { count: -1 } }
    ]);
    
    const documentsByCategory = await Document.aggregate([
      {
        $lookup: {
          from: 'documentcategories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      { 
        $group: { 
          _id: '$categoryInfo.name', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } }
    ]);
    
    const documentsUploadedByMonth = await Document.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          totalSize: { $sum: '$fileSize' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({
      documentsByType,
      documentsByCategory,
      documentsUploadedByMonth
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thống kê tài liệu', error: error.message });
  }
};

// Thống kê diễn đàn
export const getForumStatistics = async (req, res) => {
  try {
    const totalPosts = await ForumPost.countDocuments();
    const totalComments = await Comment.countDocuments();
    
    const postsPerMonth = await ForumPost.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    const commentsPerMonth = await Comment.aggregate([
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' }, 
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    const topPosters = await ForumPost.aggregate([
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 }
        }
      },
      { $sort: { postCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'authorInfo'
        }
      },
      { $unwind: '$authorInfo' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: '$authorInfo.username',
          fullName: '$authorInfo.fullName',
          postCount: 1
        }
      }
    ]);
    
    res.json({
      totalPosts,
      totalComments,
      postsPerMonth,
      commentsPerMonth,
      topPosters
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thống kê diễn đàn', error: error.message });
  }
}; 