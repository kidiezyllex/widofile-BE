import express from 'express';
import { uploadFile, deleteFile, getFileInfo } from '../controllers/upload.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import upload, { handleUploadError } from '../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload file lên Supabase Storage
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
 * /api/upload/{id}:
 *   delete:
 *     summary: Xóa file từ Supabase Storage
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của tài liệu cần xóa
 *     responses:
 *       200:
 *         description: File đã được xóa thành công
 *       403:
 *         description: Không có quyền xóa
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
 *     summary: Lấy thông tin file và URL tạm thời để download
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của tài liệu
 *     responses:
 *       200:
 *         description: Thông tin file và URL download
 *       403:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy tài liệu
 *       500:
 *         description: Lỗi server
 */
router.get('/:id/info', authenticate, getFileInfo);

export default router; 