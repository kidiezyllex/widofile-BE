import express from 'express';
import { 
  createProject, 
  getProjects, 
  getProjectById, 
  updateProject, 
  deleteProject,
  addProjectMember,
  removeProjectMember
} from '../controllers/project.controller.js';
import { authenticate, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Tạo dự án mới
 *     tags: [Projects]
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
 *               - description
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [planning, in-progress, completed, on-hold]
 *               members:
 *                 type: array
 *               gameGenre:
 *                 type: string
 *               gamePlatform:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *     responses:
 *       201:
 *         description: Dự án được tạo thành công
 */
router.post('/', authenticate, isAdmin, createProject);

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Lấy danh sách dự án
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách dự án
 */
router.get('/', authenticate, getProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Lấy thông tin dự án theo ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của dự án
 *     responses:
 *       200:
 *         description: Thông tin dự án
 *       404:
 *         description: Không tìm thấy dự án
 */
router.get('/:id', authenticate, getProjectById);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Cập nhật thông tin dự án
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của dự án
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
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [planning, in-progress, completed, on-hold]
 *               gameGenre:
 *                 type: string
 *               gamePlatform:
 *                 type: string
 *               thumbnail:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật dự án thành công
 *       404:
 *         description: Không tìm thấy dự án
 */
router.put('/:id', authenticate, updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Xóa dự án
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của dự án
 *     responses:
 *       200:
 *         description: Xóa dự án thành công
 *       404:
 *         description: Không tìm thấy dự án
 */
router.delete('/:id', authenticate, isAdmin, deleteProject);

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Thêm thành viên vào dự án
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của dự án
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [lead, member]
 *                 default: member
 *     responses:
 *       200:
 *         description: Thêm thành viên thành công
 *       404:
 *         description: Không tìm thấy dự án hoặc người dùng
 */
router.post('/:id/members', authenticate, addProjectMember);

/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Xóa thành viên khỏi dự án
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của dự án
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Xóa thành viên thành công
 *       404:
 *         description: Không tìm thấy dự án hoặc thành viên
 */
router.delete('/:id/members/:userId', authenticate, removeProjectMember);

export default router; 