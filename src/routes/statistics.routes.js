import express from 'express';
import { authenticate as protect } from '../middlewares/auth.middleware.js';
import {
  getOverviewStatistics,
  getUserStatistics,
  getProjectStatistics,
  getDocumentStatistics,
  getForumStatistics
} from '../controllers/statistics.controller.js';

const router = express.Router();

/**
 * @swagger
 * /statistics:
 *   get:
 *     summary: Lấy thống kê tổng quan
 *     description: Lấy dữ liệu thống kê tổng quan về người dùng, dự án, tài liệu và diễn đàn
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dữ liệu thống kê tổng quan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 totalProjects:
 *                   type: number
 *                 activeProjects:
 *                   type: number
 *                 totalDocuments:
 *                   type: number
 *                 totalForumPosts:
 *                   type: number
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/', protect, getOverviewStatistics);

/**
 * @swagger
 * /statistics/users:
 *   get:
 *     summary: Lấy thống kê người dùng
 *     description: Lấy dữ liệu thống kê chi tiết về người dùng theo phòng ban, chức vụ, vai trò, và thời gian tham gia
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dữ liệu thống kê người dùng
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/users', protect, getUserStatistics);

/**
 * @swagger
 * /statistics/projects:
 *   get:
 *     summary: Lấy thống kê dự án
 *     description: Lấy dữ liệu thống kê chi tiết về dự án theo trạng thái, thể loại, nền tảng và thời gian
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dữ liệu thống kê dự án
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/projects', protect, getProjectStatistics);

/**
 * @swagger
 * /statistics/documents:
 *   get:
 *     summary: Lấy thống kê tài liệu
 *     description: Lấy dữ liệu thống kê chi tiết về tài liệu theo loại, danh mục và thời gian tải lên
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dữ liệu thống kê tài liệu
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/documents', protect, getDocumentStatistics);

/**
 * @swagger
 * /statistics/forum:
 *   get:
 *     summary: Lấy thống kê diễn đàn
 *     description: Lấy dữ liệu thống kê chi tiết về bài đăng và bình luận trong diễn đàn
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dữ liệu thống kê diễn đàn
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi máy chủ
 */
router.get('/forum', protect, getForumStatistics);

export default router; 