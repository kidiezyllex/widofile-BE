import express from 'express';
import { 
  uploadDocument, 
  getDocuments, 
  getDocumentById, 
  updateDocument, 
  deleteDocument,
  shareDocument,
  unshareDocument
} from '../controllers/document.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Tải tài liệu lên
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - category
 *               - filePath
 *               - fileType
 *               - fileSize
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               project:
 *                 type: string
 *               task:
 *                 type: string
 *               filePath:
 *                 type: string
 *               fileType:
 *                 type: string
 *               fileSize:
 *                 type: number
 *               version:
 *                 type: string
 *               isShared:
 *                 type: boolean
 *               sharedWith:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Tài liệu được tải lên thành công
 */
router.post('/', authenticate, uploadDocument);

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Lấy danh sách tài liệu
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Lọc theo dự án
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Lọc theo danh mục
 *       - in: query
 *         name: creator
 *         schema:
 *           type: string
 *         description: Lọc theo người tạo
 *       - in: query
 *         name: task
 *         schema:
 *           type: string
 *         description: Lọc theo nhiệm vụ
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề, mô tả hoặc tag
 *       - in: query
 *         name: isShared
 *         schema:
 *           type: boolean
 *         description: Lọc theo trạng thái chia sẻ
 *     responses:
 *       200:
 *         description: Danh sách tài liệu
 */
router.get('/', authenticate, getDocuments);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Lấy thông tin tài liệu theo ID
 *     tags: [Documents]
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
 *         description: Thông tin tài liệu
 *       404:
 *         description: Không tìm thấy tài liệu
 */
router.get('/:id', authenticate, getDocumentById);

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Cập nhật thông tin tài liệu
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của tài liệu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               version:
 *                 type: string
 *               isShared:
 *                 type: boolean
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Cập nhật tài liệu thành công
 *       404:
 *         description: Không tìm thấy tài liệu
 */
router.put('/:id', authenticate, updateDocument);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Xóa tài liệu
 *     tags: [Documents]
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
 *         description: Xóa tài liệu thành công
 *       404:
 *         description: Không tìm thấy tài liệu
 */
router.delete('/:id', authenticate, deleteDocument);

/**
 * @swagger
 * /api/documents/{id}/share:
 *   post:
 *     summary: Chia sẻ tài liệu với người dùng khác
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của tài liệu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Chia sẻ tài liệu thành công
 *       404:
 *         description: Không tìm thấy tài liệu
 */
router.post('/:id/share', authenticate, shareDocument);

/**
 * @swagger
 * /api/documents/{id}/share/{userId}:
 *   delete:
 *     summary: Hủy chia sẻ tài liệu với người dùng
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của tài liệu
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Hủy chia sẻ tài liệu thành công
 *       404:
 *         description: Không tìm thấy tài liệu
 */
router.delete('/:id/share/:userId', authenticate, unshareDocument);

export default router; 