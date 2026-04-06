import throwError from './throwError';

const allowedMimeTypes = ['image/png', 'image/jpeg'];

export default (file) => {
  if (file && allowedMimeTypes.includes(file.mimetype)) {
    return true;
  }
  return throwError(400, 'Wrong file format');
};
