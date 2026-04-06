import StripeServices from '../services/StripeServices';
import PaymentsServices from '../services/PaymentsServices';

class StripeWebhookController {
  static handle = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    try {
      event = StripeServices.constructWebhookEvent(req.body, sig);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    try {
      if (event.type === 'checkout.session.completed') {
        await PaymentsServices.handleCheckoutSessionCompleted(event.data.object);
      }
      await PaymentsServices.recordWebhookEvent(event.id, event.type);
    } catch (err) {
      console.error(err);
      res.status(500).send('Webhook handler failed');
      return;
    }

    res.json({ received: true });
  };
}

export default StripeWebhookController;
