import express from 'express';
import { protect, admin } from '../middlewares/auth.middleware.js';
import {
  getOverviewStatistics,
  getUserStatistics,
  getProjectStatistics,
  getDocumentStatistics,
  getForumStatistics
} from '../controllers/statistics.controller.js';

const router = express.Router();

// GET /api/statistics - Thống kê tổng quan
router.get('/', protect, getOverviewStatistics);

// GET /api/statistics/users - Thống kê người dùng
router.get('/users', protect, getUserStatistics);

// GET /api/statistics/projects - Thống kê dự án
router.get('/projects', protect, getProjectStatistics);

// GET /api/statistics/documents - Thống kê tài liệu
router.get('/documents', protect, getDocumentStatistics);

// GET /api/statistics/forum - Thống kê diễn đàn
router.get('/forum', protect, getForumStatistics);

export default router; 