import mongoose from 'mongoose';
import { ENV } from './constants';

mongoose.set('strictQuery', false);

export default async function mongooseConnect(cb) {
  const uri = ENV.MONGODB_URI || `mongodb://localhost:27017/${ENV.DB_NAME}`;
  try {
    await mongoose.connect(uri);
    console.log('Connected to db');
    if (typeof cb === 'function') {
      cb();
    }
  } catch (e) {
    console.warn(e);
  }
}
