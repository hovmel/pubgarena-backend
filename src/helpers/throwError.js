import HttpError from 'http-errors';

export default (code, message) => {
  throw new HttpError(code, message);
};
