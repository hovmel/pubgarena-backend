import mongoose from 'mongoose';
import PaymentSchema from '../schemas/PaymentSchema';
import StripeWebhookEventSchema from '../schemas/StripeWebhookEventSchema';
import TournamentRegistrationSchema from '../schemas/TournamentRegistrationSchema';
import TournamentSchema from '../schemas/TournamentSchema';
import { PAYMENT_STATUS, PAYMENT_TYPE, REGISTRATION_STATUS } from '../helpers/constants';

class PaymentsServices {
  static async recordWebhookEvent(eventId, type) {
    try {
      await StripeWebhookEventSchema.create({
        stripe_event_id: eventId,
        type,
      });
    } catch (e) {
      if (e.code !== 11000) {
        throw e;
      }
    }
  }

  static listAdmin = async ({
    page = 1,
    per_page = 50,
    status,
    tournament_id,
    user_id,
    from_date,
    to_date,
  }) => {
    const filter = {};
    if (status) filter.status = status;
    if (tournament_id && mongoose.Types.ObjectId.isValid(tournament_id)) {
      filter.tournament = tournament_id;
    }
    if (user_id && mongoose.Types.ObjectId.isValid(user_id)) {
      filter.user = user_id;
    }
    if (from_date || to_date) {
      filter.createdAt = {};
      if (from_date) filter.createdAt.$gte = new Date(from_date);
      if (to_date) filter.createdAt.$lte = new Date(to_date);
    }
    const skip = (Math.max(page, 1) - 1) * Math.min(Math.max(per_page, 1), 200);
    const [items, total] = await Promise.all([
      PaymentSchema.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.min(per_page, 200))
        .populate('user', 'email name pubg_id')
        .populate('tournament', 'title slug scheduled_start_at')
        .lean(),
      PaymentSchema.countDocuments(filter),
    ]);
    return {
      items, total, page, per_page,
    };
  };

  static async handleCheckoutSessionCompleted(session) {
    const existingPay = await PaymentSchema.findOne({ stripe_checkout_session_id: session.id });
    if (existingPay) {
      return;
    }

    const registrationId = session.metadata?.registration_id;
    const tournamentId = session.metadata?.tournament_id;
    const userId = session.metadata?.user_id;

    if (!registrationId || !tournamentId || !userId) {
      return;
    }

    const pi = session.payment_intent;
    const paymentIntentId = typeof pi === 'string' ? pi : (pi?.id ? String(pi.id) : '');

    const registration = await TournamentRegistrationSchema.findById(registrationId);
    if (!registration) {
      return;
    }

    if (registration.status === REGISTRATION_STATUS.confirmed) {
      return;
    }

    registration.status = REGISTRATION_STATUS.confirmed;
    registration.stripe_payment_intent_id = paymentIntentId
      || registration.stripe_payment_intent_id;
    await registration.save();

    await TournamentSchema.updateOne(
      { _id: tournamentId },
      { $inc: { participants_confirmed_count: 1 } },
    );

    const payment = new PaymentSchema({
      provider: 'stripe',
      stripe_customer_id: session.customer ? String(session.customer) : '',
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId,
      amount_cents: session.amount_total || 0,
      amount_received_cents: session.amount_total || 0,
      currency: session.currency || 'usd',
      status: PAYMENT_STATUS.succeeded,
      type: PAYMENT_TYPE.tournament_registration,
      user: userId,
      tournament: tournamentId,
      registration: registration._id,
      customer_email: session.customer_details?.email || session.customer_email || '',
      metadata: { ...session.metadata },
      last_stripe_event_type: 'checkout.session.completed',
    });
    try {
      await payment.save();
    } catch (e) {
      if (e.code === 11000) {
        return;
      }
      throw e;
    }
  }
}

export default PaymentsServices;
