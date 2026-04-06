import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import indexRouter from './routes';
import mongooseConnect from './helpers/mongooseConnect';
import { MAX_FIELDS_SIZE_MB } from './helpers/constants';
import setupCron from './cron';
import StripeWebhookController from './controllers/StripeWebhookController';
import ImageProcessingServices from './services/ImageProcessingServices';
import initSeedData from './helpers/initSeedData';
import TelegramBotService from './services/TelegramBotService';

const app = express();

app.use(cors({
  origin: '*',
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  StripeWebhookController.handle,
);

app.use(express.json({ limit: `${MAX_FIELDS_SIZE_MB}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${MAX_FIELDS_SIZE_MB}mb` }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, '../public')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

mongooseConnect(() => {
  ImageProcessingServices.ensureUploadDirs();
  initSeedData().catch((e) => console.error('Seed failed', e));
  setupCron();
  TelegramBotService.startPolling();
});

app.use('/', indexRouter);

app.use((req, res, next) => {
  next(createError(404));
});

// Express error handlers require 4 arguments
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500).send({
    status: 'error',
    message: err.message,
    errors: err.errors,
  });
});

module.exports = app;
