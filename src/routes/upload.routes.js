import express from 'express';
import { uploadFile, deleteFile, getFileInfo } from '../controllers/upload.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import upload, { handleUploadError } from '../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload file lên Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: File cần upload
 *       - in: formData
 *         name: title
 *         type: string
 *         required: true
 *         description: Tiêu đề tài liệu
 *       - in: formData
 *         name: description
 *         type: string
 *         description: Mô tả tài liệu
 *       - in: formData
 *         name: category
 *         type: string
 *         required: true
 *         description: ID danh mục tài liệu
 *       - in: formData
 *         name: project
 *         type: string
 *         description: ID dự án (nếu có)
 *       - in: formData
 *         name: task
 *         type: string
 *         description: ID nhiệm vụ (nếu có)
 *       - in: formData
 *         name: version
 *         type: string
 *         description: Phiên bản tài liệu
 *       - in: formData
 *         name: isShared
 *         type: boolean
 *         description: Trạng thái chia sẻ
 *       - in: formData
 *         name: sharedWith
 *         type: string
 *         description: Danh sách các ID người dùng được chia sẻ, phân cách bởi dấu phẩy
 *       - in: formData
 *         name: tags
 *         type: string
 *         description: Các tag, phân cách bởi dấu phẩy
 *     responses:
 *       201:
 *         description: File đã được upload thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post('/', authenticate, upload.single('file'), handleUploadError, uploadFile);

/**
 * @swagger
 * /api/upload/cloudinary-test:
 *   post:
 *     summary: Upload file test lên Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: File cần upload test
 *     responses:
 *       200:
 *         description: File đã được upload thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
router.post('/cloudinary-test', authenticate, upload.single('file'), handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được cung cấp'
      });
    }

    // Import trực tiếp để test
    const { uploadFileToCloudinary } = await import('../services/cloudinary.service.js');
    
    // Tạo tên file và đường dẫn
    const uniqueFileName = `test-${Date.now()}-${req.file.originalname}`;
    const folderPath = 'widofile-test';
    
    // Xác định resource_type dựa vào mimetype
    let resourceType = 'auto';
    if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    }
    
    // Upload file lên Cloudinary
    const result = await uploadFileToCloudinary(
      req.file.buffer,
      uniqueFileName,
      folderPath,
      resourceType
    );
    
    res.status(200).json({
      success: true,
      message: 'Tải file lên Cloudinary thành công',
      data: result
    });
  } catch (error) {
    console.error('Lỗi khi upload file test:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Đã xảy ra lỗi khi tải file lên Cloudinary'
    });
  }
});

/**
 * @swagger
 * /api/upload/{id}:
 *   delete:
 *     summary: Xóa file từ Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: ID của tài liệu cần xóa
 *     responses:
 *       200:
 *         description: Tài liệu đã được xóa thành công
 *       403:
 *         description: Không có quyền xóa tài liệu
 *       404:
 *         description: Không tìm thấy tài liệu
 *       500:
 *         description: Lỗi server
 */
router.delete('/:id', authenticate, deleteFile);

/**
 * @swagger
 * /api/upload/{id}/info:
 *   get:
 *     summary: Lấy thông tin và URL download của file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: ID của tài liệu cần lấy thông tin
 *     responses:
 *       200:
 *         description: Thông tin tài liệu và URL download
 *       403:
 *         description: Không có quyền xem tài liệu
 *       404:
 *         description: Không tìm thấy tài liệu
 *       500:
 *         description: Lỗi server
 */
router.get('/:id/info', authenticate, getFileInfo);

export default router; 