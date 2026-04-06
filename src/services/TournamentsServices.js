import mongoose from 'mongoose';
import { randomUUID } from 'crypto';
import TournamentSchema from '../schemas/TournamentSchema';
import TournamentRegistrationSchema from '../schemas/TournamentRegistrationSchema';
import throwError from '../helpers/throwError';
import slugify from '../helpers/slugify';
import { REGISTRATION_STATUS, TOURNAMENT_STATUS } from '../helpers/constants';

class TournamentsServices {
  static isRegistrationOpen = (tournament, confirmedCount) => {
    if (!tournament || tournament.is_deleted) return false;
    if (tournament.status !== TOURNAMENT_STATUS.published) return false;
    const now = new Date();
    if (now < tournament.registration_opens_at || now > tournament.registration_closes_at) {
      return false;
    }
    if (confirmedCount >= tournament.max_participants) return false;
    return true;
  };

  static async ensureUniqueSlug(baseSlug) {
    let slug = baseSlug;
    let n = 0;
    // eslint-disable-next-line no-await-in-loop
    while (await TournamentSchema.exists({ slug, is_deleted: false })) {
      n += 1;
      slug = `${baseSlug}-${randomUUID().slice(0, 8)}`;
      if (n > 50) throwError(500, 'Could not allocate slug');
    }
    return slug;
  }

  static buildPublicListQuery = ({
    scope = 'all',
    status,
    q,
    arena_name,
    from_date,
    to_date,
  }) => {
    const filter = { is_deleted: false };

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: TOURNAMENT_STATUS.draft };
    }

    const now = new Date();

    if (scope === 'upcoming') {
      filter.scheduled_start_at = { $gte: now };
      filter.status = TOURNAMENT_STATUS.published;
    } else if (scope === 'past') {
      delete filter.status;
      const pastOr = [
        { status: TOURNAMENT_STATUS.completed },
        { scheduled_end_at: { $lt: now } },
        {
          $and: [
            { $or: [{ scheduled_end_at: null }, { scheduled_end_at: { $exists: false } }] },
            { scheduled_start_at: { $lt: now } },
          ],
        },
      ];
      filter.$and = [
        { status: { $ne: TOURNAMENT_STATUS.draft } },
        { $or: pastOr },
      ];
    }

    if (q && String(q).trim()) {
      const rx = new RegExp(String(q).trim(), 'i');
      filter.title = rx;
    }

    if (arena_name && String(arena_name).trim()) {
      filter['arena.name'] = new RegExp(String(arena_name).trim(), 'i');
    }

    if (from_date) {
      filter.scheduled_start_at = { ...filter.scheduled_start_at, $gte: new Date(from_date) };
    }
    if (to_date) {
      filter.scheduled_start_at = { ...filter.scheduled_start_at, $lte: new Date(to_date) };
    }

    return filter;
  };

  static listPublic = async ({
    scope = 'all',
    status,
    q,
    arena_name,
    from_date,
    to_date,
    page = 1,
    per_page = 20,
    sort = 'start_asc',
  }) => {
    const filter = TournamentsServices.buildPublicListQuery({
      scope, status, q, arena_name, from_date, to_date,
    });
    const skip = (Math.max(page, 1) - 1) * Math.min(Math.max(per_page, 1), 100);

    let sortObj = { scheduled_start_at: 1 };
    if (sort === 'start_desc') sortObj = { scheduled_start_at: -1 };
    if (sort === 'created_desc') sortObj = { createdAt: -1 };

    const [items, total] = await Promise.all([
      TournamentSchema.find(filter).sort(sortObj).skip(skip).limit(Math.min(per_page, 100))
        .lean(),
      TournamentSchema.countDocuments(filter),
    ]);

    return {
      items, total, page, per_page,
    };
  };

  static getByIdPublic = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throwError(400, 'Invalid id');
    }
    const t = await TournamentSchema.findOne({
      _id: id,
      is_deleted: false,
      status: { $ne: TOURNAMENT_STATUS.draft },
    }).lean();
    if (!t) {
      throwError(404, 'Tournament not found');
    }
    return t;
  };

  static getByIdAdmin = async (id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throwError(400, 'Invalid id');
    }
    const t = await TournamentSchema.findOne({ _id: id, is_deleted: false });
    if (!t) {
      throwError(404, 'Tournament not found');
    }
    return t;
  };

  static listMine = async (userId, { page = 1, per_page = 20, scope = 'all' }) => {
    const regFilter = { user: userId };
    if (scope === 'upcoming') {
      regFilter.status = REGISTRATION_STATUS.confirmed;
    }
    const skip = (Math.max(page, 1) - 1) * Math.min(Math.max(per_page, 1), 100);

    const regs = await TournamentRegistrationSchema.find(regFilter)
      .populate({
        path: 'tournament',
        match: { is_deleted: false },
      })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Math.min(per_page, 100));

    const items = regs.filter((r) => r.tournament);
    const now = new Date();
    let filtered = items;
    if (scope === 'upcoming') {
      filtered = items.filter((r) => r.tournament && r.tournament.scheduled_start_at >= now);
    } else if (scope === 'past') {
      filtered = items.filter((r) => {
        const t = r.tournament;
        if (!t) return false;
        if (t.status === TOURNAMENT_STATUS.completed) return true;
        if (t.scheduled_end_at && new Date(t.scheduled_end_at) < now) return true;
        if (!t.scheduled_end_at && new Date(t.scheduled_start_at) < now) return true;
        return false;
      });
    }

    const total = await TournamentRegistrationSchema.countDocuments({ user: userId });

    return {
      items: filtered, total, page, per_page,
    };
  };

  static countConfirmed = (tournamentId) => TournamentRegistrationSchema.countDocuments({
    tournament: tournamentId,
    status: REGISTRATION_STATUS.confirmed,
  });

  static create = async (data, adminId) => {
    const baseSlug = slugify(data.title);
    const slug = await TournamentsServices.ensureUniqueSlug(baseSlug);
    const doc = new TournamentSchema({
      ...data,
      slug,
      created_by_admin: adminId,
    });
    await doc.save();
    return doc;
  };

  static update = async (id, patch) => {
    const t = await TournamentsServices.getByIdAdmin(id);
    const allowed = [
      'title', 'description', 'status', 'scheduled_start_at', 'scheduled_end_at',
      'registration_opens_at', 'registration_closes_at',
      'price_amount_cents', 'price_currency', 'max_participants', 'min_participants',
      'arena', 'pubg_details', 'prizes', 'cover_image_url', 'external', 'stats_published',
    ];
    allowed.forEach((k) => {
      if (patch[k] !== undefined) {
        t[k] = patch[k];
      }
    });
    await t.save();
    return t;
  };

  static setStatsPublished = async (id, value) => {
    const t = await TournamentsServices.getByIdAdmin(id);
    t.stats_published = Boolean(value);
    await t.save();
    return t;
  };
}

export default TournamentsServices;
