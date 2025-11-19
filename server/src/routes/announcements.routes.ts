import { Router } from 'express';
import { authMiddleware, requireTeacherOrAdmin } from '../middlewares/auth.middleware.js';
import {
  listAnnouncements,
  getAnnouncement,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcement.controller.js';

const router = Router();

router.get('/', authMiddleware, listAnnouncements);
router.get('/:id', authMiddleware, getAnnouncement);
router.post('/', authMiddleware, requireTeacherOrAdmin, createAnnouncement);
router.patch('/:id', authMiddleware, requireTeacherOrAdmin, updateAnnouncement);
router.delete('/:id', authMiddleware, requireTeacherOrAdmin, deleteAnnouncement);

export default router;
