import Stripe from 'stripe';
import throwError from '../helpers/throwError';
import { ENV } from '../helpers/constants';

let stripeClient;

function getStripe() {
  if (!ENV.STRIPE_SECRET_KEY) {
    throwError(503, 'Stripe is not configured');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(ENV.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

class StripeServices {
  static createTournamentCheckoutSession = async ({
    registrationId,
    tournamentId,
    userId,
    userEmail,
    title,
    amountCents,
    currency,
  }) => {
    const stripe = getStripe();
    const base = ENV.APP_PUBLIC_URL.replace(/\/$/, '');

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: userEmail || undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: amountCents,
            product_data: {
              name: title,
              metadata: { tournament_id: tournamentId.toString() },
            },
          },
        },
      ],
      success_url: `${base}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/payments/cancel?tournament_id=${tournamentId}`,
      metadata: {
        registration_id: registrationId.toString(),
        tournament_id: tournamentId.toString(),
        user_id: userId.toString(),
      },
    });

    return session;
  };

  static constructWebhookEvent = (rawBody, signature) => {
    if (!ENV.STRIPE_WEBHOOK_SECRET) {
      throwError(503, 'Stripe webhook secret is not configured');
    }
    const stripe = getStripe();
    return stripe.webhooks.constructEvent(rawBody, signature, ENV.STRIPE_WEBHOOK_SECRET);
  };
}

export default StripeServices;
