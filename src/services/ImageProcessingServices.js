import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

const TOURNAMENT_COVER_MAX = { w: 1600, h: 900 };
const ANNOUNCEMENT_IMAGE_MAX = { w: 1200, h: 800 };

function publicRoot() {
  return path.join(process.cwd(), 'public');
}

function dirTournaments() {
  return path.join(publicRoot(), 'images', 'tournaments');
}

function dirAnnouncements() {
  return path.join(publicRoot(), 'images', 'announcements');
}

function dirDefault() {
  return path.join(publicRoot(), 'images', 'default');
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function publicRelativeUrl(absoluteFilePath) {
  const normalized = path.normalize(absoluteFilePath);
  const pub = path.normalize(publicRoot());
  const rel = path.relative(pub, normalized).replace(/\\/g, '/');
  return `/${rel}`;
}

class ImageProcessingServices {
  static ensureUploadDirs() {
    ensureDir(dirTournaments());
    ensureDir(dirAnnouncements());
    ensureDir(dirDefault());
  }

  static async saveTournamentCover(buffer) {
    ImageProcessingServices.ensureUploadDirs();
    const filename = `${randomUUID()}.jpg`;
    const filePath = path.join(dirTournaments(), filename);
    await sharp(buffer)
      .rotate()
      .resize(TOURNAMENT_COVER_MAX.w, TOURNAMENT_COVER_MAX.h, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toFile(filePath);
    return publicRelativeUrl(filePath);
  }

  static async saveAnnouncementImage(buffer) {
    ImageProcessingServices.ensureUploadDirs();
    const filename = `${randomUUID()}.jpg`;
    const filePath = path.join(dirAnnouncements(), filename);
    await sharp(buffer)
      .rotate()
      .resize(ANNOUNCEMENT_IMAGE_MAX.w, ANNOUNCEMENT_IMAGE_MAX.h, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toFile(filePath);
    return publicRelativeUrl(filePath);
  }
}

export default ImageProcessingServices;
