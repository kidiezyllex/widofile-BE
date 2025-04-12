import DocumentCategory from '../models/documentCategory.model.js';
import mongoose from 'mongoose';

/**
 * @desc    Tạo danh mục tài liệu mới
 * @route   POST /document-categories
 * @access  Private/Admin
 */
export const createDocumentCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    // Kiểm tra tên danh mục đã tồn tại chưa
    const existingCategory = await DocumentCategory.findOne({ name });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Tên danh mục đã tồn tại'
      });
    }
    
    // Tạo danh mục mới
    const category = new DocumentCategory({
      name,
      description,
      icon
    });
    
    await category.save();
    
    res.status(201).json({
      success: true,
      message: 'Danh mục tài liệu được tạo thành công',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Lấy tất cả danh mục tài liệu
 * @route   GET /document-categories
 * @access  Private
 */
export const getDocumentCategories = async (req, res) => {
  try {
    const categories = await DocumentCategory.find()
      .sort({ name: 1 });
    
    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Lấy thông tin danh mục tài liệu theo ID
 * @route   GET /document-categories/:id
 * @access  Private
 */
export const getDocumentCategoryById = async (req, res) => {
  try {
    const category = await DocumentCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục tài liệu'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Cập nhật thông tin danh mục tài liệu
 * @route   PUT /document-categories/:id
 * @access  Private/Admin
 */
export const updateDocumentCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    
    const category = await DocumentCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục tài liệu'
      });
    }
    
    // Kiểm tra tên danh mục mới đã tồn tại chưa (nếu tên bị thay đổi)
    if (name && name !== category.name) {
      const existingCategory = await DocumentCategory.findOne({ name });
      
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Tên danh mục đã tồn tại'
        });
      }
    }
    
    // Cập nhật thông tin danh mục
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    
    await category.save();
    
    res.json({
      success: true,
      message: 'Cập nhật danh mục tài liệu thành công',
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Xóa danh mục tài liệu
 * @route   DELETE /document-categories/:id
 * @access  Private/Admin
 */
export const deleteDocumentCategory = async (req, res) => {
  try {
    const category = await DocumentCategory.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục tài liệu'
      });
    }
    
    // Kiểm tra xem danh mục có đang được sử dụng không
    const Document = mongoose.model('Document');
    const documentCount = await Document.countDocuments({ category: category._id });
    
    if (documentCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục vì có ${documentCount} tài liệu đang sử dụng`
      });
    }
    
    await category.deleteOne();
    
    res.json({
      success: true,
      message: 'Xóa danh mục tài liệu thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 