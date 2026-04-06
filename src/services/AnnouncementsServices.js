import AnnouncementSchema from '../schemas/AnnouncementSchema';
import throwError from '../helpers/throwError';

class AnnouncementsServices {
  static listPublic = async ({ limit = 20 }) => {
    const now = new Date();
    const items = await AnnouncementSchema.find({
      is_active: true,
      $and: [
        {
          $or: [{ active_from: null }, { active_from: { $lte: now } }],
        },
        {
          $or: [{ active_until: null }, { active_until: { $gte: now } }],
        },
      ],
    })
      .sort({ sort_order: 1, createdAt: -1 })
      .limit(Math.min(limit, 100))
      .lean();
    return items;
  };

  static listAdmin = async ({ page = 1, per_page = 50 }) => {
    const skip = (Math.max(page, 1) - 1) * Math.min(Math.max(per_page, 1), 200);
    const [items, total] = await Promise.all([
      AnnouncementSchema.find({})
        .sort({ sort_order: 1, createdAt: -1 })
        .skip(skip)
        .limit(Math.min(per_page, 200)),
      AnnouncementSchema.countDocuments({}),
    ]);
    return {
      items, total, page, per_page,
    };
  };

  static create = async (data, adminId) => {
    const doc = new AnnouncementSchema({
      ...data,
      created_by_admin: adminId,
    });
    await doc.save();
    return doc;
  };

  static update = async (id, patch) => {
    const doc = await AnnouncementSchema.findById(id);
    if (!doc) {
      throwError(404, 'Announcement not found');
    }
    Object.assign(doc, patch);
    await doc.save();
    return doc;
  };

  static remove = async (id) => {
    const doc = await AnnouncementSchema.findByIdAndDelete(id);
    if (!doc) {
      throwError(404, 'Announcement not found');
    }
    return doc;
  };
}

export default AnnouncementsServices;
