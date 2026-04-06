import express from 'express';
import authAdmin from '../middlewares/authAdmin';
import { ADMIN_ACCESS } from '../helpers/constants';
import { uploadSingle } from '../helpers/multer';
import wrapMulter from '../helpers/wrapMulter';
import AdminTournamentsController from '../controllers/admin/AdminTournamentsController';
import AdminTournamentStatsController from '../controllers/admin/AdminTournamentStatsController';
import AdminAnnouncementsController from '../controllers/admin/AdminAnnouncementsController';
import AdminPaymentsController from '../controllers/admin/AdminPaymentsController';

const router = express.Router();

const uploadCover = wrapMulter(uploadSingle({ name: 'cover' }));
const uploadAnnouncementImage = wrapMulter(uploadSingle({ name: 'image' }));

router.get(
  '/tournaments',
  authAdmin(ADMIN_ACCESS.manageTournaments.code),
  AdminTournamentsController.list,
);

router.get(
  '/tournaments/:id',
  authAdmin(ADMIN_ACCESS.manageTournaments.code),
  AdminTournamentsController.getOne,
);

router.post(
  '/tournaments',
  authAdmin(ADMIN_ACCESS.manageTournaments.code),
  AdminTournamentsController.create,
);

router.patch(
  '/tournaments/:id',
  authAdmin(ADMIN_ACCESS.manageTournaments.code),
  AdminTournamentsController.update,
);

router.post(
  '/tournaments/:id/stats-published',
  authAdmin(ADMIN_ACCESS.manageTournaments.code),
  AdminTournamentsController.setStatsPublished,
);

router.post(
  '/tournaments/:id/cover',
  authAdmin(ADMIN_ACCESS.manageTournaments.code),
  uploadCover,
  AdminTournamentsController.uploadCover,
);

router.get(
  '/tournaments/:id/registrations',
  authAdmin(ADMIN_ACCESS.manageRegistrations.code),
  AdminTournamentsController.registrations,
);

router.get(
  '/tournaments/:id/stats',
  authAdmin(ADMIN_ACCESS.uploadTournamentStats.code),
  AdminTournamentStatsController.get,
);

router.post(
  '/tournaments/:id/stats',
  authAdmin(ADMIN_ACCESS.uploadTournamentStats.code),
  AdminTournamentStatsController.replace,
);

router.get(
  '/announcements',
  authAdmin(ADMIN_ACCESS.manageAnnouncements.code),
  AdminAnnouncementsController.list,
);

router.post(
  '/announcements',
  authAdmin(ADMIN_ACCESS.manageAnnouncements.code),
  AdminAnnouncementsController.create,
);

router.patch(
  '/announcements/:id',
  authAdmin(ADMIN_ACCESS.manageAnnouncements.code),
  AdminAnnouncementsController.update,
);

router.delete(
  '/announcements/:id',
  authAdmin(ADMIN_ACCESS.manageAnnouncements.code),
  AdminAnnouncementsController.remove,
);

router.post(
  '/announcements/:id/image',
  authAdmin(ADMIN_ACCESS.manageAnnouncements.code),
  uploadAnnouncementImage,
  AdminAnnouncementsController.uploadImage,
);

router.get(
  '/payments',
  authAdmin(ADMIN_ACCESS.viewPayments.code),
  AdminPaymentsController.list,
);

export default router;
