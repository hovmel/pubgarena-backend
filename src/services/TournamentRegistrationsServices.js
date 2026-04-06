import TournamentRegistrationSchema from '../schemas/TournamentRegistrationSchema';
import TournamentSchema from '../schemas/TournamentSchema';
import UserSchema from '../schemas/UserSchema';
import throwError from '../helpers/throwError';
import { REGISTRATION_STATUS } from '../helpers/constants';
import StripeServices from './StripeServices';
import TournamentsServices from './TournamentsServices';

class TournamentRegistrationsServices {
  static startCheckout = async ({ tournamentId, userId }) => {
    const tournament = await TournamentSchema.findOne({
      _id: tournamentId,
      is_deleted: false,
    });
    if (!tournament) {
      throwError(404, 'Tournament not found');
    }

    const confirmedCount = await TournamentsServices.countConfirmed(tournamentId);
    if (!TournamentsServices.isRegistrationOpen(tournament, confirmedCount)) {
      throwError(400, 'Registration is not open for this tournament');
    }

    let registration = await TournamentRegistrationSchema.findOne({
      tournament: tournamentId,
      user: userId,
    });

    if (registration?.status === REGISTRATION_STATUS.confirmed) {
      throwError(400, 'Already registered');
    }

    const user = await UserSchema.findById(userId);
    if (!user) {
      throwError(404, 'User not found');
    }
    if (!user.is_email_confirmed) {
      throwError(403, 'Подтвердите email перед регистрацией в турнире');
    }

    if (!registration) {
      registration = new TournamentRegistrationSchema({
        tournament: tournamentId,
        user: userId,
        status: REGISTRATION_STATUS.pending_payment,
        amount_cents: tournament.price_amount_cents,
        currency: tournament.price_currency,
      });
    } else {
      registration.status = REGISTRATION_STATUS.pending_payment;
      registration.amount_cents = tournament.price_amount_cents;
      registration.currency = tournament.price_currency;
    }

    const session = await StripeServices.createTournamentCheckoutSession({
      registrationId: registration._id,
      tournamentId: tournament._id,
      userId: user._id,
      userEmail: user.email,
      title: tournament.title,
      amountCents: tournament.price_amount_cents,
      currency: tournament.price_currency,
    });

    registration.stripe_checkout_session_id = session.id;
    await registration.save();

    return { url: session.url, registration_id: registration._id };
  };

  static listForTournamentAdmin = async (tournamentId, { page = 1, per_page = 50, status }) => {
    const filter = { tournament: tournamentId };
    if (status) filter.status = status;
    const skip = (Math.max(page, 1) - 1) * Math.min(Math.max(per_page, 1), 200);
    const [items, total] = await Promise.all([
      TournamentRegistrationSchema.find(filter)
        .populate('user', 'email name pubg_id telegram_username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.min(per_page, 200)),
      TournamentRegistrationSchema.countDocuments(filter),
    ]);
    return {
      items, total, page, per_page,
    };
  };
}

export default TournamentRegistrationsServices;
