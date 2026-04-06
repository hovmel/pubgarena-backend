import mongoose, { Schema } from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '' },
    image_url: { type: String, default: '' },
    sort_order: { type: Number, default: 0, index: true },
    is_active: { type: Boolean, default: true, index: true },
    active_from: { type: Date, default: null },
    active_until: { type: Date, default: null },
    created_by_admin: { type: Schema.Types.ObjectId, ref: 'Admin', default: null },
  },
  { timestamps: true },
);

export default mongoose.model('Announcement', announcementSchema);
