import Validator from 'validatorjs';
import throwError from './throwError';

export default function validate(input, rules, customMessages) {
  const data = new Validator(input, rules, customMessages);

  if (data.fails()) {
    throwError(400, data.errors);
  }
  return data;
}
