import AnnouncementsServices from '../services/AnnouncementsServices';

class AnnouncementsController {
  static list = async (req, res, next) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const items = await AnnouncementsServices.listPublic({ limit });
      res.json({ status: 'ok', announcements: items });
    } catch (e) {
      next(e);
    }
  };
}

export default AnnouncementsController;
