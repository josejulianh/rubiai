// Stripe Webhook Handlers for Rubi Premium
import { getStripeSync, getUncachableStripeClient } from './stripeClient';
import { storage } from './storage';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    // Process with stripe-replit-sync first (syncs to local DB)
    const sync = await getStripeSync();
    await sync.processWebhook(payload, signature);

    // Now handle business logic for subscription updates
    try {
      const stripe = await getUncachableStripeClient();
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      await WebhookHandlers.handleSubscriptionEvent(event);
    } catch (err) {
      // If webhook secret not set, try parsing without verification (dev mode)
      const event = JSON.parse(payload.toString());
      await WebhookHandlers.handleSubscriptionEvent(event);
    }
  }

  static async handleSubscriptionEvent(event: any): Promise<void> {
    const eventType = event.type;
    const data = event.data?.object;

    if (!data) return;

    switch (eventType) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await WebhookHandlers.updateUserSubscription(data);
        break;
      case 'customer.subscription.deleted':
        await WebhookHandlers.cancelUserSubscription(data);
        break;
      case 'checkout.session.completed':
        if (data.mode === 'subscription') {
          console.log('Checkout completed for subscription:', data.subscription);
        }
        break;
    }
  }

  static async updateUserSubscription(subscription: any): Promise<void> {
    const customerId = subscription.customer;
    const subscriptionId = subscription.id;
    const status = subscription.status;
    const endDate = subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000) 
      : null;

    // Find user by stripeCustomerId and update their premium status
    const user = await storage.findUserByStripeCustomerId(customerId);
    if (user) {
      await storage.updateUserPreferences(user.userId, {
        isPremium: status === 'active',
        stripeSubscriptionId: subscriptionId,
        subscriptionStatus: status,
        subscriptionEndDate: endDate,
      });
      console.log(`Updated subscription for user ${user.userId}: ${status}`);
    }
  }

  static async cancelUserSubscription(subscription: any): Promise<void> {
    const customerId = subscription.customer;

    const user = await storage.findUserByStripeCustomerId(customerId);
    if (user) {
      await storage.updateUserPreferences(user.userId, {
        isPremium: false,
        subscriptionStatus: 'cancelled',
      });
      console.log(`Cancelled subscription for user ${user.userId}`);
    }
  }
}
