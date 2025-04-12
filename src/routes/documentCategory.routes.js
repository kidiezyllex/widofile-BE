import express from 'express';
import { 
  createDocumentCategory, 
  getDocumentCategories, 
  getDocumentCategoryById, 
  updateDocumentCategory, 
  deleteDocumentCategory 
} from '../controllers/documentCategory.controller.js';
import { authenticate, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/document-categories:
 *   post:
 *     summary: Tạo danh mục tài liệu mới
 *     tags: [Document Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Danh mục tài liệu được tạo thành công
 */
router.post('/', authenticate, isAdmin, createDocumentCategory);

/**
 * @swagger
 * /api/document-categories:
 *   get:
 *     summary: Lấy danh sách danh mục tài liệu
 *     tags: [Document Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách danh mục tài liệu
 */
router.get('/', authenticate, getDocumentCategories);

/**
 * @swagger
 * /api/document-categories/{id}:
 *   get:
 *     summary: Lấy thông tin danh mục tài liệu theo ID
 *     tags: [Document Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của danh mục tài liệu
 *     responses:
 *       200:
 *         description: Thông tin danh mục tài liệu
 *       404:
 *         description: Không tìm thấy danh mục tài liệu
 */
router.get('/:id', authenticate, getDocumentCategoryById);

/**
 * @swagger
 * /api/document-categories/{id}:
 *   put:
 *     summary: Cập nhật thông tin danh mục tài liệu
 *     tags: [Document Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của danh mục tài liệu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật danh mục tài liệu thành công
 *       404:
 *         description: Không tìm thấy danh mục tài liệu
 */
router.put('/:id', authenticate, isAdmin, updateDocumentCategory);

/**
 * @swagger
 * /api/document-categories/{id}:
 *   delete:
 *     summary: Xóa danh mục tài liệu
 *     tags: [Document Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của danh mục tài liệu
 *     responses:
 *       200:
 *         description: Xóa danh mục tài liệu thành công
 *       404:
 *         description: Không tìm thấy danh mục tài liệu
 */
router.delete('/:id', authenticate, isAdmin, deleteDocumentCategory);

export default router; 