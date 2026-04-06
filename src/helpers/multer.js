import multer from 'multer';
import path from 'path';
import { MAX_FIELDS_SIZE_MB, PHOTOS_COUNT } from './constants';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fieldSize: MAX_FIELDS_SIZE_MB * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const acceptedExtensionsList = ['.jpg', '.jpeg', '.png'];
    const extname = path.extname(file.originalname).toLowerCase();
    if (acceptedExtensionsList.includes(extname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file extension'));
    }
  },
});

export const uploadArray = ({ name = 'image', maxCount = PHOTOS_COUNT.uploadAtOnce } = {}) => upload.array(name, maxCount);

export const uploadSingle = ({ name = 'image' } = {}) => upload.single(name);
