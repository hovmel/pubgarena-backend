import AnnouncementsServices from '../../services/AnnouncementsServices';
import ImageProcessingServices from '../../services/ImageProcessingServices';
import validate from '../../helpers/validation';
import validateFileType from '../../helpers/validateFileType';
import throwError from '../../helpers/throwError';

class AdminAnnouncementsController {
  static list = async (req, res, next) => {
    try {
      const { page, per_page } = req.query;
      const result = await AnnouncementsServices.listAdmin({
        page: Number(page) || 1,
        per_page: Number(per_page) || 50,
      });
      res.json({ status: 'ok', ...result });
    } catch (e) {
      next(e);
    }
  };

  static create = async (req, res, next) => {
    try {
      validate(req.body, {
        title: 'required|string|min:1',
        body: 'string',
      });
      const doc = await AnnouncementsServices.create({
        title: req.body.title,
        body: req.body.body || '',
        image_url: req.body.image_url || '',
        sort_order: req.body.sort_order != null ? Number(req.body.sort_order) : 0,
        is_active: req.body.is_active !== false && req.body.is_active !== 'false',
        active_from: req.body.active_from ? new Date(req.body.active_from) : null,
        active_until: req.body.active_until ? new Date(req.body.active_until) : null,
      }, req.adminId);
      res.json({ status: 'ok', announcement: doc });
    } catch (e) {
      next(e);
    }
  };

  static update = async (req, res, next) => {
    try {
      const patch = {};
      if (req.body.title !== undefined) patch.title = req.body.title;
      if (req.body.body !== undefined) patch.body = req.body.body;
      if (req.body.image_url !== undefined) patch.image_url = req.body.image_url;
      if (req.body.sort_order !== undefined) patch.sort_order = Number(req.body.sort_order);
      if (req.body.is_active !== undefined) {
        patch.is_active = req.body.is_active !== false && req.body.is_active !== 'false';
      }
      if (req.body.active_from !== undefined) {
        patch.active_from = req.body.active_from ? new Date(req.body.active_from) : null;
      }
      if (req.body.active_until !== undefined) {
        patch.active_until = req.body.active_until ? new Date(req.body.active_until) : null;
      }
      const doc = await AnnouncementsServices.update(req.params.id, patch);
      res.json({ status: 'ok', announcement: doc });
    } catch (e) {
      next(e);
    }
  };

  static remove = async (req, res, next) => {
    try {
      await AnnouncementsServices.remove(req.params.id);
      res.json({ status: 'ok' });
    } catch (e) {
      next(e);
    }
  };

  static uploadImage = async (req, res, next) => {
    try {
      const { file } = req;
      if (!file) {
        throwError(400, 'Image file is required');
      }
      validateFileType(file);
      const url = await ImageProcessingServices.saveAnnouncementImage(file.buffer);
      const doc = await AnnouncementsServices.update(req.params.id, { image_url: url });
      res.json({ status: 'ok', announcement: doc });
    } catch (e) {
      next(e);
    }
  };
}

export default AdminAnnouncementsController;
