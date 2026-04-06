import TournamentsServices from '../../services/TournamentsServices';
import TournamentRegistrationsServices from '../../services/TournamentRegistrationsServices';
import ImageProcessingServices from '../../services/ImageProcessingServices';
import TournamentSchema from '../../schemas/TournamentSchema';
import TournamentRegistrationSchema from '../../schemas/TournamentRegistrationSchema';
import validate from '../../helpers/validation';
import validateFileType from '../../helpers/validateFileType';
import throwError from '../../helpers/throwError';
import { REGISTRATION_STATUS, TOURNAMENT_STATUS } from '../../helpers/constants';

function parseMaybeJson(value) {
  if (value == null || value === '') return undefined;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

class AdminTournamentsController {
  static getOne = async (req, res, next) => {
    try {
      const t = await TournamentsServices.getByIdAdmin(req.params.id);
      const confirmed = await TournamentRegistrationSchema.countDocuments({
        tournament: t._id,
        status: REGISTRATION_STATUS.confirmed,
      });
      res.json({
        status: 'ok',
        tournament: t,
        registration: { slots_taken: confirmed, slots_total: t.max_participants },
      });
    } catch (e) {
      next(e);
    }
  };

  static list = async (req, res, next) => {
    try {
      const {
        status, q, page, per_page, sort, from_date, to_date,
      } = req.query;
      const filter = { is_deleted: false };
      if (status) filter.status = status;
      if (q) filter.title = new RegExp(String(q).trim(), 'i');
      if (from_date || to_date) {
        filter.scheduled_start_at = {};
        if (from_date) filter.scheduled_start_at.$gte = new Date(from_date);
        if (to_date) filter.scheduled_start_at.$lte = new Date(to_date);
      }
      const p = Math.max(Number(page) || 1, 1);
      const pp = Math.min(Math.max(Number(per_page) || 20, 1), 100);
      const skip = (p - 1) * pp;
      let sortObj = { scheduled_start_at: 1 };
      if (sort === 'start_desc') sortObj = { scheduled_start_at: -1 };
      if (sort === 'created_desc') sortObj = { createdAt: -1 };

      const [items, total] = await Promise.all([
        TournamentSchema.find(filter).sort(sortObj).skip(skip).limit(pp)
          .lean(),
        TournamentSchema.countDocuments(filter),
      ]);
      res.json({
        status: 'ok', items, total, page: p, per_page: pp,
      });
    } catch (e) {
      next(e);
    }
  };

  static create = async (req, res, next) => {
    try {
      validate(req.body, {
        title: 'required|string|min:2',
        description: 'string',
        scheduled_start_at: 'required',
        registration_opens_at: 'required',
        registration_closes_at: 'required',
        price_amount_cents: 'required|numeric|min:0',
        max_participants: 'required|numeric|min:1',
      });

      const scheduled_end_at = req.body.scheduled_end_at || null;
      const prizes = parseMaybeJson(req.body.prizes) || [];
      const pubg_details = parseMaybeJson(req.body.pubg_details) || {};
      const arena = parseMaybeJson(req.body.arena) || { name: req.body['arena.name'] || '' };
      const external = parseMaybeJson(req.body.external) || {};

      if (!Array.isArray(prizes)) {
        throwError(400, 'prizes must be an array');
      }

      const doc = await TournamentsServices.create({
        title: req.body.title,
        description: req.body.description || '',
        status: req.body.status || TOURNAMENT_STATUS.draft,
        scheduled_start_at: new Date(req.body.scheduled_start_at),
        scheduled_end_at: scheduled_end_at ? new Date(scheduled_end_at) : null,
        registration_opens_at: new Date(req.body.registration_opens_at),
        registration_closes_at: new Date(req.body.registration_closes_at),
        price_amount_cents: Number(req.body.price_amount_cents),
        price_currency: (req.body.price_currency || 'usd').toLowerCase(),
        max_participants: Number(req.body.max_participants),
        min_participants: req.body.min_participants != null
          ? Number(req.body.min_participants)
          : 1,
        arena,
        pubg_details,
        prizes,
        external,
        cover_image_url: '',
      }, req.adminId);

      res.json({ status: 'ok', tournament: doc });
    } catch (e) {
      next(e);
    }
  };

  static update = async (req, res, next) => {
    try {
      const patch = { ...req.body };
      [
        'scheduled_start_at', 'scheduled_end_at', 'registration_opens_at', 'registration_closes_at',
      ].forEach((k) => {
        if (patch[k]) patch[k] = new Date(patch[k]);
      });
      if (patch.scheduled_end_at === '') patch.scheduled_end_at = null;
      ['price_amount_cents', 'max_participants', 'min_participants'].forEach((k) => {
        if (patch[k] != null) patch[k] = Number(patch[k]);
      });
      if (patch.prizes != null) patch.prizes = parseMaybeJson(patch.prizes);
      if (patch.pubg_details != null) patch.pubg_details = parseMaybeJson(patch.pubg_details);
      if (patch.arena != null) patch.arena = parseMaybeJson(patch.arena);
      if (patch.external != null) patch.external = parseMaybeJson(patch.external);
      if (patch.price_currency) patch.price_currency = String(patch.price_currency).toLowerCase();

      delete patch.slug;
      delete patch.participants_confirmed_count;
      delete patch.is_deleted;

      const doc = await TournamentsServices.update(req.params.id, patch);
      res.json({ status: 'ok', tournament: doc });
    } catch (e) {
      next(e);
    }
  };

  static setStatsPublished = async (req, res, next) => {
    try {
      const raw = req.body.stats_published;
      const statsPublished = raw === true || raw === 'true' || raw === 1 || raw === '1';
      if (raw === undefined) {
        throwError(400, 'stats_published is required');
      }
      const doc = await TournamentsServices.setStatsPublished(req.params.id, statsPublished);
      res.json({ status: 'ok', tournament: doc });
    } catch (e) {
      next(e);
    }
  };

  static uploadCover = async (req, res, next) => {
    try {
      const { file } = req;
      if (!file) {
        throwError(400, 'Cover file is required');
      }
      validateFileType(file);
      const url = await ImageProcessingServices.saveTournamentCover(file.buffer);
      const doc = await TournamentsServices.update(req.params.id, { cover_image_url: url });
      res.json({ status: 'ok', tournament: doc });
    } catch (e) {
      next(e);
    }
  };

  static registrations = async (req, res, next) => {
    try {
      const { page, per_page, status } = req.query;
      const result = await TournamentRegistrationsServices.listForTournamentAdmin(req.params.id, {
        page: Number(page) || 1,
        per_page: Number(per_page) || 50,
        status,
      });
      res.json({ status: 'ok', ...result });
    } catch (e) {
      next(e);
    }
  };
}

export default AdminTournamentsController;
