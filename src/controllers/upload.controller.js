import { uploadFileToSupabase, deleteFileFromSupabase } from '../services/supabase.service.js';
import Document from '../models/document.model.js';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../services/supabase.service.js';
import Project from '../models/project.model.js';

/**
 * @desc    Upload file lên Supabase Storage
 * @route   POST /upload
 * @access  Private
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được cung cấp'
      });
    }

    const { 
      title, 
      description = '', 
      category, 
      project, 
      task, 
      version = '1.0', 
      tags = [], 
      isShared = false, 
      sharedWith = []
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        success: false,
        message: 'Tiêu đề và danh mục là bắt buộc'
      });
    }

    // Tạo đường dẫn lưu trữ duy nhất cho file
    const originalName = req.file.originalname;
    const fileExtension = originalName.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;

    // Folder path trong storage: userId/categoryId
    const filePath = `${req.user._id}/${category}`;

    // Upload file lên Supabase
    const fileData = await uploadFileToSupabase(
      req.file.buffer,
      uniqueFileName,
      filePath,
      req.file.mimetype
    );

    // Tạo document mới trong MongoDB
    const document = new Document({
      title,
      description,
      category,
      project,
      task,
      creator: req.user._id,
      filePath: fileData.fullPath,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      version,
      isShared,
      sharedWith: sharedWith.length > 0 ? sharedWith.split(',') : [],
      tags: Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim())
    });

    await document.save();

    // Trả về document đã populate
    const populatedDocument = await Document.findById(document._id)
      .populate('category', 'name')
      .populate('creator', 'fullName avatar')
      .populate('project', 'name')
      .populate('task', 'title');

    res.status(201).json({
      success: true,
      message: 'Tải tài liệu lên thành công',
      data: {
        document: populatedDocument,
        file: {
          path: fileData.path,
          publicUrl: fileData.publicUrl
        }
      }
    });
  } catch (error) {
    console.error('Lỗi khi upload file:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi tải tài liệu lên'
    });
  }
};

/**
 * @desc    Xóa file từ Supabase Storage
 * @route   DELETE /upload/:id
 * @access  Private
 */
export const deleteFile = async (req, res) => {
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

    // Xóa file từ Supabase Storage
    if (document.filePath) {
      await deleteFileFromSupabase(document.filePath.replace(/^[^/]+\//, ''));
    }

    // Xóa document từ MongoDB
    await document.deleteOne();

    res.json({
      success: true,
      message: 'Đã xóa tài liệu thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa file:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi xóa tài liệu'
    });
  }
};

/**
 * @desc    Lấy thông tin file từ Supabase
 * @route   GET /upload/:id/info
 * @access  Private
 */
export const getFileInfo = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('category', 'name')
      .populate('creator', 'fullName avatar')
      .populate('project', 'name')
      .populate('task', 'title');

    if (!document) {
      return res.status(404).json({
        success: false, 
        message: 'Không tìm thấy tài liệu'
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== 'admin') {
      const isCreator = document.creator._id.toString() === req.user._id.toString();
      const isSharedWith = document.sharedWith.some(id => id.toString() === req.user._id.toString());
      
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

    // Lấy URL tạm thời để download (có thời hạn)
    const bucketName = document.filePath.split('/')[0];
    const filePath = document.filePath.replace(`${bucketName}/`, '');
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60 * 60); // URL có hiệu lực trong 1 giờ

    if (error) throw error;

    res.json({
      success: true,
      data: {
        document,
        downloadUrl: data.signedUrl
      }
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin file:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi lấy thông tin tài liệu'
    });
  }
}; 