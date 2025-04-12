import express from 'express';
import { 
  createForumPost, 
  getForumPosts, 
  getForumPostById, 
  updateForumPost, 
  deleteForumPost 
} from '../controllers/forumPost.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/forum-posts:
 *   post:
 *     summary: Tạo bài viết diễn đàn mới
 *     tags: [Forum Posts]
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
 *               - content
 *               - project
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               project:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPinned:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Bài viết đã được tạo thành công
 */
router.post('/', authenticate, createForumPost);

/**
 * @swagger
 * /api/forum-posts:
 *   get:
 *     summary: Lấy danh sách bài viết diễn đàn
 *     tags: [Forum Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Lọc theo dự án
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Lọc theo tác giả
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Lọc theo tag
 *       - in: query
 *         name: isPinned
 *         schema:
 *           type: boolean
 *         description: Lọc theo bài ghim
 *     responses:
 *       200:
 *         description: Danh sách bài viết diễn đàn
 */
router.get('/', authenticate, getForumPosts);

/**
 * @swagger
 * /api/forum-posts/{id}:
 *   get:
 *     summary: Lấy thông tin bài viết diễn đàn theo ID
 *     tags: [Forum Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Thông tin bài viết
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.get('/:id', authenticate, getForumPostById);

/**
 * @swagger
 * /api/forum-posts/{id}:
 *   put:
 *     summary: Cập nhật bài viết diễn đàn
 *     tags: [Forum Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của bài viết
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPinned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Cập nhật bài viết thành công
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.put('/:id', authenticate, updateForumPost);

/**
 * @swagger
 * /api/forum-posts/{id}:
 *   delete:
 *     summary: Xóa bài viết diễn đàn
 *     tags: [Forum Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của bài viết
 *     responses:
 *       200:
 *         description: Xóa bài viết thành công
 *       404:
 *         description: Không tìm thấy bài viết
 */
router.delete('/:id', authenticate, deleteForumPost);

export default router; 