import express from 'express';
import { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask 
} from '../controllers/task.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Tạo nhiệm vụ mới
 *     tags: [Tasks]
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
 *               - description
 *               - project
 *               - phase
 *               - startDate
 *               - dueDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               project:
 *                 type: string
 *               phase:
 *                 type: string
 *                 enum: [concept, pre-production, production, testing, post-production]
 *               assignedTo:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [not-started, in-progress, review, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *     responses:
 *       201:
 *         description: Nhiệm vụ được tạo thành công
 */
router.post('/', authenticate, createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Lấy danh sách nhiệm vụ
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: project
 *         schema:
 *           type: string
 *         description: Lọc theo dự án
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: phase
 *         schema:
 *           type: string
 *         description: Lọc theo giai đoạn
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *         description: Lọc theo người được giao
 *     responses:
 *       200:
 *         description: Danh sách nhiệm vụ
 */
router.get('/', authenticate, getTasks);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Lấy thông tin nhiệm vụ theo ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của nhiệm vụ
 *     responses:
 *       200:
 *         description: Thông tin nhiệm vụ
 *       404:
 *         description: Không tìm thấy nhiệm vụ
 */
router.get('/:id', authenticate, getTaskById);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Cập nhật thông tin nhiệm vụ
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của nhiệm vụ
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
 *               phase:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               progress:
 *                 type: number
 *               completedDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Cập nhật nhiệm vụ thành công
 *       404:
 *         description: Không tìm thấy nhiệm vụ
 */
router.put('/:id', authenticate, updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Xóa nhiệm vụ
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của nhiệm vụ
 *     responses:
 *       200:
 *         description: Xóa nhiệm vụ thành công
 *       404:
 *         description: Không tìm thấy nhiệm vụ
 */
router.delete('/:id', authenticate, deleteTask);

export default router; 