import express from 'express';
import { 
  createComment, 
  getComments, 
  updateComment, 
  deleteComment 
} from '../controllers/comment.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Tạo bình luận mới
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               forumPost:
 *                 type: string
 *               task:
 *                 type: string
 *               document:
 *                 type: string
 *               user:
 *                 type: string
 *               parentComment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bình luận đã được tạo thành công
 */
router.post('/', authenticate, createComment);

/**
 * @swagger
 * /api/comments:
 *   get:
 *     summary: Lấy danh sách bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: forumPost
 *         schema:
 *           type: string
 *         description: ID của bài viết
 *       - in: query
 *         name: task
 *         schema:
 *           type: string
 *         description: ID của nhiệm vụ
 *       - in: query
 *         name: document
 *         schema:
 *           type: string
 *         description: ID của tài liệu
 *       - in: query
 *         name: user
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *       - in: query
 *         name: parentComment
 *         schema:
 *           type: string
 *         description: ID của bình luận cha
 *     responses:
 *       200:
 *         description: Danh sách bình luận
 */
router.get('/', authenticate, getComments);

/**
 * @swagger
 * /api/comments/{id}:
 *   put:
 *     summary: Cập nhật bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của bình luận
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật bình luận thành công
 *       404:
 *         description: Không tìm thấy bình luận
 */
router.put('/:id', authenticate, updateComment);

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Xóa bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của bình luận
 *     responses:
 *       200:
 *         description: Xóa bình luận thành công
 *       404:
 *         description: Không tìm thấy bình luận
 */
router.delete('/:id', authenticate, deleteComment);

export default router; 