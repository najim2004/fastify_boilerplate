import Stripe from 'stripe';
import env from '../../app/env';

const stripeSecretKey = env.STRIPE_SECRET_KEY || '';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-05-27.dahlia', // using a stable modern apiVersion
});

export class StripePaymentService {
  async createPaymentMethod(
    card: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    },
    billingDetails: Stripe.PaymentMethodCreateParams.BillingDetails,
  ): Promise<Stripe.PaymentMethod> {
    return stripe.paymentMethods.create({
      type: 'card',
      card,
      billing_details: billingDetails,
    });
  }

  async createCustomer(
    userId: string,
    name: string,
    email: string,
  ): Promise<Stripe.Customer> {
    const customer = await stripe.customers.create({
      name,
      email,
      metadata: {
        user_id: userId,
      },
      description: 'New Customer',
    });
    return customer as Stripe.Customer;
  }

  async attachCustomerPaymentMethodId(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.PaymentMethod> {
    return stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });
  }

  async setCustomerDefaultPaymentMethodId(
    customerId: string,
    paymentMethodId: string,
  ): Promise<Stripe.Customer> {
    const customer = await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    return customer as Stripe.Customer;
  }

  async updateCustomer(
    customerId: string,
    name: string,
    email: string,
  ): Promise<Stripe.Customer> {
    const customer = await stripe.customers.update(customerId, {
      name,
      email,
    });
    return customer as Stripe.Customer;
  }

  async getCustomerByID(
    id: string,
  ): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
    return stripe.customers.retrieve(id);
  }

  async createBillingSession(
    customerId: string,
  ): Promise<Stripe.BillingPortal.Session> {
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: env.APP_URL,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    customerId: string,
    metadata?: Stripe.MetadataParam,
  ): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // amount in cents
      currency,
      customer: customerId,
      metadata,
    });
  }

  async createCheckoutSession(): Promise<Stripe.Checkout.Session> {
    const successUrl = `${env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${env.APP_URL}/failed`;

    return stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Sample Product',
            },
            unit_amount: 2000, // $20.00
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async createCheckoutSessionSubscription(
    customerId: string,
    priceId: string,
  ): Promise<Stripe.Checkout.Session> {
    const successUrl = `${env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${env.APP_URL}/failed`;

    return stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
  }

  async calculateTax(
    amount: number,
    currency: string,
    customerDetails: Stripe.Tax.CalculationCreateParams.CustomerDetails,
  ): Promise<Stripe.Tax.Calculation> {
    return stripe.tax.calculations.create({
      currency,
      customer_details: customerDetails,
      line_items: [
        {
          amount: Math.round(amount * 100),
          tax_behavior: 'exclusive',
          reference: 'tax_calculation',
        },
      ],
    });
  }

  async createTaxTransaction(
    taxCalculationId: string,
  ): Promise<Stripe.Tax.Transaction> {
    return stripe.tax.transactions.createFromCalculation({
      calculation: taxCalculationId,
      reference: 'tax_transaction',
    });
  }

  async downloadInvoiceUrl(paymentIntentId: string): Promise<string | null> {
    const invoice = await stripe.invoices.retrieve(paymentIntentId);
    return invoice.hosted_invoice_url || null;
  }

  async createConnectedAccount(email: string): Promise<Stripe.Account> {
    return stripe.accounts.create({
      type: 'express',
      email,
      country: 'US',
      capabilities: {
        transfers: {
          requested: true,
        },
      },
    });
  }

  async createOnboardingAccountLink(
    accountId: string,
  ): Promise<Stripe.AccountLink> {
    return stripe.accountLinks.create({
      account: accountId,
      refresh_url: env.APP_URL,
      return_url: env.APP_URL,
      type: 'account_onboarding',
    });
  }

  async createTransfer(
    accountId: string,
    amount: number,
    currency: string,
  ): Promise<Stripe.Transfer> {
    return stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency,
      destination: accountId,
    });
  }

  async createPayout(
    accountId: string,
    amount: number,
    currency: string,
  ): Promise<Stripe.Payout> {
    return stripe.payouts.create(
      {
        amount: Math.round(amount * 100),
        currency,
      },
      {
        stripeAccount: accountId,
      },
    );
  }

  async checkBalance(accountId: string): Promise<Stripe.Balance> {
    return stripe.balance.retrieve(
      {},
      {
        stripeAccount: accountId,
      },
    );
  }

  async createToken(
    bankAccount: Stripe.TokenCreateParams.BankAccount,
  ): Promise<Stripe.Token> {
    return stripe.tokens.create({
      bank_account: bankAccount,
    });
  }

  async createBankAccount(
    customerId: string,
    bankAccountToken: string,
  ): Promise<Stripe.CustomerSource> {
    return stripe.customers.createSource(customerId, {
      source: bankAccountToken,
    });
  }

  async verifyBankAccount(
    customerId: string,
    bankAccountId: string,
    amounts: [number, number],
  ): Promise<Stripe.CustomerSource> {
    return stripe.customers.verifySource(customerId, bankAccountId, {
      amounts,
    });
  }

  async createACHPaymentIntent(
    customerId: string,
    amount: number,
  ): Promise<Stripe.PaymentIntent> {
    return stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      customer: customerId,
      payment_method_types: ['us_bank_account'],
      payment_method_options: {
        us_bank_account: {
          verification_method: 'automatic',
        },
      },
    });
  }

  handleWebhook(rawBody: string | Buffer, sig: string): Stripe.Event {
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET || '';
    return stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  }
}

export const stripePaymentService = new StripePaymentService();
export default stripePaymentService;
